# Phân tích mã nguồn — react-zalo-auth-kit

> Tài liệu này được tạo dựa trên phân tích cấu trúc (knowledge graph qua GitNexus) và đọc trực tiếp mã nguồn.

## 1. Mục đích

`react-zalo-auth-kit` là package npm cung cấp **React component kit để đăng nhập qua Zalo OAuth 2.0 (PKCE)**, có thể tích hợp trực tiếp với Firebase Auth thông qua một "Custom Token Flow". Về bản chất, package mô phỏng shape của một Firebase Auth Provider (`AuthProvider`/`OAuthProvider`) để Zalo có thể "cắm" vào hệ sinh thái FirebaseUI.

- Version hiện tại: `1.0.70`
- License: MIT
- Peer deps: `react@^18`, `firebase@^9`, `pkce-challenge@^3`, `react-new-window@^0.2`

## 2. Thống kê (GitNexus index)

| Metric | Giá trị |
|---|---|
| Files | 51 |
| Symbols (nodes) | 419 |
| Edges | 716 |
| Clusters | 23 |
| Execution flows (processes) | 21 |

## 3. Cấu trúc thư mục

```
src/                        mã nguồn thư viện (entry: src/index.js)
├─ index.js                 entry point — export public API
├─ ZaloAuthProvider.js      class/type theo khuôn Firebase Auth (Auth, User, OAuthProvider, ZaloAuthProvider...)
├─ ZaloLoginButton.js       component nút đăng nhập (logic, dùng auth/authProvider)
├─ ZaloStyledButton.js      component nút đăng nhập (UI thuần, style FirebaseUI)
├─ ZaloLoginPopup.js        wrapper mở popup OAuth (dùng react-new-window)
├─ useZaloAuthFlow.js       hook thay thế — tự quản lý popup + polling bằng useState/useEffect
├─ useZaloAuthKit.js        hook "all-in-one" thứ 3 — tự cài lại toàn bộ flow (PKCE, fetch, login...)
├─ signInWithZalo.js        gọi Zalo Graph API — KHÔNG được import ở đâu (dead code)
├─ util.js                  helper: params() (query-string builder/parser), pkceCode(), openPopup()
└─ loading/                 overlay loading, mount/unmount thủ công ngoài cây React chính

example/                    demo CRA — flow cơ bản (BasicAuth, LoginButton, StyledButton)
example-cloud/               demo CRA — flow dùng Cloud Function để cấp custom token
passport-cloud/              Firebase Cloud Functions + Firestore rules (backend cấp custom token)
stories/, .storybook/        Storybook cho 3 component chính (ZaloStyledButton, ZaloLoginPopup, full flow)
```

## 4. Ba cách triển khai song song

Điểm đáng chú ý nhất: repo có **3 cách độc lập** để thực hiện cùng một flow OAuth + PKCE, không chia sẻ code với nhau (PKCE, `params`, `fetch` bị viết lại 3 lần gần như giống nhau):

| # | Thành phần | Cơ chế callback | Vai trò |
|---|---|---|---|
| 1 | `getZaloAuth()` + `ZaloAuthProvider` + `ZaloLoginButton` (`index.js`, `ZaloLoginButton.js`) | `setInterval` polling `window.location.search`, dùng `window.opener.handleZaloResponse` | **API chính**, được export công khai |
| 2 | Hook `useZaloAuthFlow` (`useZaloAuthFlow.js`) | `useEffect` + `setInterval`, so khớp `state` | Bản refactor theo hướng hook |
| 3 | Hook `useZaloAuthKit` (`useZaloAuthKit.js`) | Không tự mở popup; expose `login()` để gọi tay sau khi nhận redirect params | Bản "kit" độc lập, không phụ thuộc popup tự động |

Cách 1 là luồng được export và dùng trong ví dụ chính thức. Cách 2 và 3 trông như các bản refactor/thử nghiệm chưa được hợp nhất.

## 5. Luồng đăng nhập chính (API chính — cách 1)

1. `getZaloAuth(config)` (`src/index.js:46`) tạo object `authApp` chứa `oauthUri`, `accessTokenUri`, và hàm `onAuthStateChanged` (polling listener).
2. `ZaloLoginButton` gọi `signInZaloWithPopup(auth, authProvider)` (`src/index.js:261`) khi click → sinh PKCE bằng `pkce-challenge` → mở popup `oauth.zaloapp.com` qua `openPopup()` (`src/util.js:107`).
3. Tab gốc (qua `onAuthStateChanged` polling `window.location.search`) phát hiện `code`/`state`/`code_challenge` → gọi `signInWithAuthCode()` để đổi `code` lấy `access_token` (`src/index.js:158`).
4. `signInWithZalo()` (`src/index.js:229`) gọi Zalo Graph API (`graph.zalo.me/v2.0/me`) lấy thông tin user theo `scopes`.
5. Nếu có `customTokenFlow`: gọi `authProvider.credentialFromResult()` (`src/ZaloAuthProvider.js:964`) → POST tới endpoint backend (Cloud Function trong `passport-cloud/functions/index.js`) để đổi sang Firebase Custom Token → `signInWithCustomToken(firebaseAuth, token)`.
6. Kết quả được gửi về tab gốc qua `window.opener.handleZaloResponse(...)` rồi `window.close()`; tab chính nhận event và gọi callback của `ZaloLoginButton`.

## 6. API export công khai (`src/index.js`)

```
useZaloAuthKit, ZaloLoginPopup, ZaloLoginButton, ZaloStyledButton,
useZaloAuthFlow, ZaloAuthProvider, getZaloAuth,
signInZaloWithPopup, signInWithAuthCode, signInWithRefreshToken, signInWithZalo
```

## 7. Vấn đề phát hiện qua phân tích graph

- **Circular import**: `src/ZaloLoginButton.js → src/index.js → src/ZaloLoginButton.js`. `index.js` import `ZaloLoginButton` để re-export, còn `ZaloLoginButton.js` lại import `signInZaloWithPopup` từ `index.js` (`src/ZaloLoginButton.js:4`) — vòng lặp module, có thể gây lỗi `undefined` nếu thứ tự load thay đổi.
- **Dead code**: `src/signInWithZalo.js` không được file nào import. `index.js` định nghĩa lại một hàm `signInWithZalo` riêng với logic gần như giống 100%. Nên xoá file này hoặc hợp nhất.
- **Trùng lặp logic 3 lần**: PKCE generate/verify, `params()` (query-string builder), và các lệnh `fetch` tới Zalo API được viết lại độc lập trong `index.js`, `useZaloAuthFlow.js`, `useZaloAuthKit.js`, `util.js` — rủi ro lệch hành vi khi sửa một nơi mà quên nơi khác.
- **`ZaloAuthProvider.js` (1010 dòng)** phần lớn là mock lại type definitions của Firebase Auth SDK (`Auth`, `User`, `OAuthProvider`, `FirebaseError`...) để `ZaloAuthProvider` có shape tương thích — chỉ vài phần là logic thật (`ZaloAuthConfigure`, `CustomTokenFlow`, `credentialFromResult`).
- **`loading/index.js`** mount/unmount một React root riêng thẳng vào `document.body`, ngoài cây component chính — cách làm kiểu cũ (`react-confirm-alert`), không theo idiom React hiện đại.

## 8. Build & phân phối

- Build bằng Babel: `babel src --out-dir dist --copy-files`. Repo có cấu hình `rollup.config.js` + `tsconfig.json` (sinh `.d.ts`) nhưng script `build` chính thức **không dùng Rollup** — cấu hình Rollup có vẻ chưa được wire vào pipeline thật.
- Phát hành: `npm run auto` → `patch` (bump version) → `build` → `publisher` (npm publish).
- `postbuild` copy `package.json`, `.npmignore`, `README.md`, `LICENSE` vào `dist/` trước khi publish.

## 9. Gợi ý cải thiện (nếu refactor)

1. Gỡ circular import bằng cách tách `signInZaloWithPopup` ra khỏi `index.js` thành module riêng, để `ZaloLoginButton.js` import trực tiếp module đó.
2. Xoá `src/signInWithZalo.js` (dead code) hoặc import dùng lại từ `index.js`/module chung thay vì định nghĩa trùng.
3. Hợp nhất 3 cách triển khai PKCE flow (`index.js`, `useZaloAuthFlow.js`, `useZaloAuthKit.js`) về một core dùng chung, các API public chỉ là wrapper mỏng.
4. Quyết định dùng Rollup hoặc Babel cho build, bỏ cấu hình không dùng tới để tránh nhầm lẫn.
