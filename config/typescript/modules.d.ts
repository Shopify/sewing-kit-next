declare module 'tree-node-cli' {
  interface Options {
    [key: string]: any;
  }

  function tree(path: string, options: Options): string;
  export = tree;
}
