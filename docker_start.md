# From backend/

docker build -t ai-job-portal-backend .

docker run -d \
 --name backend \
 -p 8000:8000 -p 9001:9001 -p 9002:9002 -p 9003:9003 -p 9004:9004 \
 -v $(pwd)/data:/app/data \ # persist SQLite DBs
--env-file .env \ # pass secrets
ai-job-portal-backend
