clear
ls
clear
ls
wsl.exe --set-default-version <1|2>
clear
cd ~
ls
cd home
clear
mkdir home
;s
ls
cd home/
clear
git clone git@github.com:Eben717/FeePayMe.git
ls
clear
git remote -v
git remote set-url origin git@github.com:Eben717/FeePayMe.git
ssh-keygen -t ed25519 -C "kwabenat679@gmail.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
clear
cat ~/.ssh/id_ed25519.pub
clear
git clone git@github.com:Eben717/FeePayMe.git
clear
cd FeePayMe/
ls
cd a
cd audit-fee-app/
npm run dev
npm install
nvm install --lts
nvm use --lts
node -v
npm -v
clear
# Install curl if missing
sudo apt update && sudo apt install -y curl ca-certificates
# Install NVM (official script)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
clear
# For bash (default in Ubuntu)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# Add to your ~/.bashrc so it loads automatically next time
grep -q 'nvm.sh' ~/.bashrc || cat >> ~/.bashrc <<'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
EOF

nvm install --lts
nvm use --lts
node -v
npm -v
clear
npm run dev
# if you just switched Node versions, clean install is safest
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install
clear
# if you just switched Node versions, clean install is safest
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install
cat package.json
npm i -D vite
npm i -D @vitejs/plugin-react
npm i -D @vitejs/plugin-vue
clear
npm run dev
cd ~
cd home/
clear
cd FeePayMe/audit-fee-app/
clear
