import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";

// 루트는 독립 화면이 아니라 진입 라우터다. 현재 화면은 login·qa 둘뿐이라
// 로그인 상태면 /qa, 아니면 /login 으로 보낸다. (미인증은 proxy 가 먼저
// /login 으로 보내지만, 여기서도 보조로 처리한다.)
// 페이지가 늘어나면 실제 랜딩/대시보드로 교체.
export default async function Home() {
  const user = await requireUser();
  redirect(user ? "/qa" : "/login");
}
