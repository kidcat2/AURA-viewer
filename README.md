# AURA-viewer

Web-based interactive viewer for 3D Gaussian Splatting.  
PLY 파일을 브라우저에서 직접 로드하고, 커스텀 쉐이더와 동적 조명을 적용해 렌더링합니다.

---

## Features

- **PLY 파싱** — 3DGS PLY 파일을 브라우저에서 직접 파싱
- **커스텀 쉐이더** — Billboard / 2DGS 렌더링 모드, GLSL 쉐이더 직접 작성
- **동적 조명** — 2DGS 노멀 기반 실시간 조명 반응
- **VRM 통합** *(예정)* — VRM 캐릭터와 3DGS 씬의 IBL 연동

---

## Stack

`React` `Three.js` `WebGL` `TypeScript`

---

## Project Structure

```
src/
  core/
    parsers/      PLY 파서
    shaders/      GLSL 쉐이더
  viewer/         Three.js 렌더러
  types/          공통 타입 정의
```
