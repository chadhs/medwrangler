# medwrangler

this is an exercise to build a full stack site using cloud native components.

## development
### install dependencies and backend infra
```sh
cd frontend 
npm install
cd ../backend
npm install
npx sst dev
```

### configure frontend
create a `.env.local` in the `frontend` directory and add the api url from the previous step
```.env
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com
```

now run `npm run dev`

you should now be able to visit http://localhost:3000

## production deploy
run sst to deploy prod
```sh
npx sst deploy --stage prod
```

ApiEndpoint: https://v27fusrpji.execute-api.us-east-2.amazonaws.com
WebsiteURL: https://d5vpzct3nl0o.cloudfront.net
