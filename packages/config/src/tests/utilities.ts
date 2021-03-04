export const packageConfig = `
import {createPackage} from '@sewing-kit/config';

export default createPackage((pkg) => {
  pkg.entry({root: '/src/index'});
})`;

export const defaultEntry = `
export function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
`;

export const legacySewingKitConfig = `
export default function sewingKitConfig(plugins, env) {
  return {
    name: 'legacy-config',
    plugins: [
      plugins.paths({
        app: 'foo/app'
      })
    ]
  }
};
`;
