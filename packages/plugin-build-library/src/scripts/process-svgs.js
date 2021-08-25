const {resolve: resolvePath} = require('path');
const {readFileSync, writeFileSync} = require('fs');

const glob = require('glob');
const {optimize} = require('svgo');

(() => {
  glob
    .sync(resolvePath(__dirname, '..', 'src/**/*.svg'))
    .forEach((imagePath) => {
      const imageString = readFileSync(imagePath);
      const result = optimize(imageString, {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
        ],
        path: imagePath,
        multipass: true,
      });
      const optimizedSvgString = result.data;
      writeFileSync(imagePath, `${optimizedSvgString}\n`);
    });
})();
