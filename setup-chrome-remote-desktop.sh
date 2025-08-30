#!/bin/bash

echo "🚀 Setting up Chrome Remote Desktop on Linux Mint..."

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install required dependencies
echo "🔧 Installing dependencies..."
sudo apt install -y wget curl gnupg2

# Add Google Chrome repository
echo "🌐 Adding Google Chrome repository..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Update again to include Chrome repo
sudo apt update

# Install Google Chrome
echo "📱 Installing Google Chrome..."
sudo apt install -y google-chrome-stable

# Download Chrome Remote Desktop
echo "🖥️ Downloading Chrome Remote Desktop..."
wget https://dl.google.com/linux/direct/google-chrome-remote-desktop_current_amd64.deb

# Install Chrome Remote Desktop
echo "⚙️ Installing Chrome Remote Desktop..."
sudo dpkg -i google-chrome-remote-desktop_current_amd64.deb

# Fix any dependency issues
sudo apt --fix-broken install -y

# Install additional required packages
echo "📋 Installing additional packages..."
sudo apt install -y xvfb x11vnc

# Set up environment
echo "🔧 Setting up environment..."
echo "export DISPLAY=:20" >> ~/.bashrc
source ~/.bashrc

# Enable and start service
echo "🚀 Enabling Chrome Remote Desktop service..."
sudo systemctl enable chrome-remote-desktop
sudo systemctl start chrome-remote-desktop

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Chrome on this Linux Mint machine"
echo "2. Go to: https://remotedesktop.google.com/access"
echo "3. Click 'Turn on' to enable remote access"
echo "4. Set up a PIN (6-digit)"
echo "5. Note down the access code"
echo "6. On your Windows machine, use the Chrome Remote Desktop extension to connect"
echo ""
echo "🔗 Access URL: https://remotedesktop.google.com/access"
