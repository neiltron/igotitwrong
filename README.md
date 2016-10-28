# SNDS

### Setup
`npm install`

### Usage
`gulp serve`
`gulp serve:dist`

### Build
`gulp build`

### Deploy
Deploy will run build and send assets to GH.
`gulp deploy`

### Publish
Publish will run build, send assets to Amazon S3, and purge Cloudflare cache for https://igotitwrong.com/
`gulp publish`
