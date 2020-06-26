
# multiQuasar
 
 This is my first attempt at getting multiple SSR Quasar apps into Express.
 
 Each **Quasar app** is located within the apps directory.  The url of the app is the apps directory name.
 
 

>     For example:  app1  the url will be http://xxxxxx/app1
>     For example:  app2  the url will be http://xxxxxx/app2

 
 Some changes are needed if you want to do this for your app, as follows:
 
 Inside the `quasar.conf` I have added an environment variable which is used within the routes.js file;
 You also need to change the distribution directory

      const path = require('path')
      ......
      build: {
          distDir: __dirname+'/../.dist/'+path.basename(path.resolve(__dirname)),
          env: {
            "ROUTE_DIR": path.basename(path.resolve(__dirname))
          },
      
 
 You'll also need to copy (or copy and paste) the index.js from within src-ssr directory.

To get up and running I have created a bash file that you can run to build all the apps 1 by 1  `./buildAll`  you may need to chmod +x this file to make it executable.  If this doesn't work, you'll need to change to each app (ie. cd apps/app1) and run `quasar build -m ssr`

When this has finished make sure you are in the root and then type
 `node server.js`

You should be then able to browser your localhost on port 3000 followed by the app directory name (as shown above).

As a side note... if you drop an app into the apps folder, make sure to copy any package Dependencies into the root package.json

