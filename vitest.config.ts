import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 'server-only' 는 import 시 "클라이언트에서 못 씀" 에러를 던진다.
      // 실제 가드는 next build 가 수행하고, vitest(node)에선 무의미하므로
      // 패키지가 제공하는 빈 모듈(empty.js)로 치환해 테스트가 server-only
      // 모듈을 import 할 수 있게 한다. (Next 공식 server-only 패턴의 표준 우회)
      'server-only': path.resolve(__dirname, 'node_modules/server-only/empty.js'),
    },
  },
})
