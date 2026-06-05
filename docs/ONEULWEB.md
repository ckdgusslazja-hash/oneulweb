# oneulweb.com 배포 체크리스트

운영 도메인: **https://oneulweb.com**

---

## 1. GitHub에 코드 올리기

```powershell
cd "C:\Users\User\Desktop\홈페이지"
.\scripts\push-github.ps1
```

저장소: **https://github.com/ckdgusslazja-hash/oneulweb**

GitHub에서 `oneulweb` 빈 저장소를 먼저 만든 뒤 push 하세요.

---

## 2. Vercel 배포 (CLI)

```powershell
cd "C:\Users\User\Desktop\홈페이지"
npx vercel --prod --yes
```

또는 GitHub 연결: https://vercel.com/new → 저장소 Import

---

## 3. 도메인 DNS (카페24)

카페24 DNS 관리에서:

| 타입 | 호스트 | 값 |
|------|--------|-----|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

Vercel 프로젝트 → **Settings → Domains** 에 추가:

- `oneulweb.com`
- `www.oneulweb.com`

`www`는 `vercel.json`에서 루트 도메인으로 리다이렉트됩니다.

DNS 반영까지 최대 24~48시간 걸릴 수 있습니다.

---

## 4. 재배포

코드 수정 후:

```powershell
npx vercel --prod --yes
```

또는 GitHub push 시 Vercel이 자동 배포 (연결된 경우).
