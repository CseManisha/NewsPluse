
#!/usr/bin/env bash
set -o errexit

cd backend
npm install

cd ../scraper
python -m pip install -r requirements.txt