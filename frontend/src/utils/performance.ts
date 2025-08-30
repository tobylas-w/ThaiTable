// Performance optimization utilities for ThaiTable

// Debounce function for search inputs and API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle function for scroll events and frequent updates
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        func(...args)
      }, delay - (now - lastCall))
    }
  }
}

// Memoization utility for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading utility for images and components
export const lazyLoad = {
  // Intersection Observer for lazy loading images
  createImageObserver: (callback: (entry: IntersectionObserverEntry) => void) => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(callback)
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )
  },

  // Lazy load image
  loadImage: (img: HTMLImageElement, src: string) => {
    img.src = src
    img.classList.remove('lazy')
  },

  // Preload critical images
  preloadImages: (urls: string[]) => {
    urls.forEach(url => {
      const img = new Image()
      img.src = url
    })
  }
}

// Virtual scrolling utilities for large lists
export const virtualScroll = {
  // Calculate visible items for virtual scrolling
  getVisibleItems: (
    items: any[],
    containerHeight: number,
    itemHeight: number,
    scrollTop: number
  ) => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  },

  // Optimize list rendering
  optimizeList: <T>(
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode,
    keyExtractor: (item: T, index: number) => string | number
  ) => {
    return items.map((item, index) => (
      <div key={keyExtractor(item, index)}>
        {renderItem(item, index)}
      </div>
    ))
  }
}

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure function execution time
  measure: <T extends (...args: any[]) => any>(
    name: string,
    func: T
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now()
      const result = func(...args)
      const end = performance.now()
      
      if (import.meta.env.DEV) {
        console.log(`${name} took ${(end - start).toFixed(2)}ms`)
      }
      
      return result
    }
  },

  // Monitor component render performance
  monitorRender: (componentName: string) => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      if (import.meta.env.DEV) {
        console.log(`${componentName} rendered in ${(end - start).toFixed(2)}ms`)
      }
    }
  },

  // Track memory usage
  trackMemory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
    return null
  }
}

// Cache utilities for API responses and expensive data
export const cache = {
  // Simple in-memory cache
  memory: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  // Set cache item
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    cache.memory.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  },

  // Get cache item
  get: <T>(key: string): T | null => {
    const item = cache.memory.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      cache.memory.delete(key)
      return null
    }

    return item.data
  },

  // Clear cache
  clear: () => {
    cache.memory.clear()
  },

  // Clear expired items
  cleanup: () => {
    const now = Date.now()
    for (const [key, item] of cache.memory.entries()) {
      if (now - item.timestamp > item.ttl) {
        cache.memory.delete(key)
      }
    }
  }
}

// Batch processing utilities
export const batchProcessor = {
  // Process items in batches
  processBatch: async <T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    delay: number = 100
  ): Promise<R[]> => {
    const results: R[] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(processor))
      results.push(...batchResults)
      
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return results
  },

  // Queue for processing tasks
  createQueue: <T>() => {
    const queue: T[] = []
    let processing = false

    const process = async (handler: (item: T) => Promise<void>) => {
      if (processing) return
      processing = true

      while (queue.length > 0) {
        const item = queue.shift()!
        try {
          await handler(item)
        } catch (error) {
          console.error('Queue processing error:', error)
        }
      }

      processing = false
    }

    return {
      add: (item: T) => queue.push(item),
      process,
      get length() { return queue.length },
      get isProcessing() { return processing }
    }
  }
}

// Animation utilities for smooth transitions
export const animation = {
  // Smooth scroll to element
  scrollTo: (element: HTMLElement, duration: number = 300) => {
    const start = window.pageYOffset
    const target = element.offsetTop
    const distance = target - start
    const startTime = performance.now()

    const easeInOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutQuad(progress)

      window.scrollTo(0, start + distance * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  },

  // Fade in animation
  fadeIn: (element: HTMLElement, duration: number = 300) => {
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ease-in-out`
    
    requestAnimationFrame(() => {
      element.style.opacity = '1'
    })
  },

  // Slide in animation
  slideIn: (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'left', duration: number = 300) => {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    }

    element.style.transform = transforms[direction]
    element.style.transition = `transform ${duration}ms ease-in-out`
    
    requestAnimationFrame(() => {
      element.style.transform = 'translate(0, 0)'
    })
  }
}

// Export default utilities
export default {
  debounce,
  throttle,
  memoize,
  lazyLoad,
  virtualScroll,
  performanceMonitor,
  cache,
  batchProcessor,
  animation
}
