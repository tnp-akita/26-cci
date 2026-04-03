import { defineConfig } from "vite";
//インストールした「vite-plugin-singlefile」をインポート
import { viteSingleFile } from "vite-plugin-singlefile";
import { createHtmlPlugin } from 'vite-plugin-html'
export default defineConfig({
  //pluginsに記述することでJSとCSSがインライン化された単一htmlを出力するように
  plugins: [viteSingleFile(),

    createHtmlPlugin({
      minify: true
    })
    ,
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      // Lightning CSSの設定
      cssModules: true,
    },
  },
});