<!-- HARNESS-KIT:BEGIN -->
@.harness-kit/CLAUDE.fragment.md
<!-- HARNESS-KIT:END -->

## 터미널 환경: cmux (tmux 아님)

이 환경은 **cmux** 를 사용합니다. **tmux 가 아닙니다.**

- **cmux** = manaflow-ai 가 만든 macOS 네이티브 터미널 (Swift/AppKit + libghostty). AI 코딩 에이전트 제어를 위해 설계됨.
- **tmux** 와 이름이 비슷하지만 완전히 다른 도구입니다. 명령어/플래그/소켓 프로토콜이 호환되지 않습니다.

### 사용자가 "cmux" 라고 말하면

- 절대 `tmux` 명령을 생성하거나 제안하지 말 것.
- `tmux new-session`, `tmux attach`, `tmux send-keys` 등 tmux CLI 로 치환해서 답하지 말 것.
- cmux CLI (`cmux read-screen`, `cmux send`, `cmux browser` 등) 와 Unix socket JSON-RPC 를 사용할 것.
- 잘 모르는 cmux 하위 명령이 나오면, tmux 로 추측하지 말고 `cmux --help` 를 실행하거나 사용자에게 확인할 것.

### 빠른 구분 체크리스트

| 신호 | 도구 |
|------|------|
| 사용자가 "cmux" 라고 명시 | **cmux** |
| 사이드바/탭/내장 브라우저 언급 | **cmux** |
| macOS 네이티브 GUI 터미널 맥락 | **cmux** |
| SSH 원격 서버 세션 유지 | tmux |
| Linux 서버 / Windows / 헤드리스 환경 | tmux |

> 헷갈리면 항상 cmux 로 가정하고, tmux 명령으로 답하기 전에 사용자에게 한 번 더 확인할 것.
