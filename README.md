# ILJIN CNS R&D Team Project

일진씨앤에스 R&D Team 프로젝트

## What's inside?

- package 폴더 안에 공통으로 사용되어질 UI 및 layout, 각종 스크립트와 설정 등을 정의
- apps 폴더 프로젝트 단위로 애플리케이션을 생성

## 시작 전

- node, turbo build tool 설치
- pnpm을 프로젝트의 패키지 매니저로 사용하는 것을 강력히 권장
  - pnpm은 다음과 같은 주요 이점을 제공합니다
    - 속도 향상: pnpm은 글로벌 저장소를 사용하여 패키지를 관리. npm이나 Yarn에 비해 최대 2배 속도향상
    - 디스크 공간 절약: 글로벌 저장소를 통해 동일한 패키지의 여러 버전을 효율적으로 관리하여 디스크 공간을 절약
    - 의존성 관리 개선: pnpm은 호이스팅 문제를 해결하고 더 안전한 패키지 관리를 제공
    - 모노레포 지원: pnpm은 모노레포 구조를 효과적으로 지원하여 대규모 프로젝트 관리에 적합함

### node version

node 20.x.x 이상 버전 사용(lts 버전 사용 권장)

- `Download Node.js`: [nodeJS](https://nodejs.org/en/download/package-manager)

### 패키지매니저 설치

- Performant npm install(pnpm)
  - `Install pnpm`: [pnpm](https://pnpm.io/ko/installation)
- yarn
  - `Install yarn`: [yarn](https://www.heropy.dev/p/ijqX9h)
- npm
  - `Install npm`: [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
  
### turbo build install

- `turborepo 글로벌 설치`: [Install turbo](https://turbo.build/repo/docs/getting-started/existing-monorepo#install-turbo).

```
npm install turbo --global or pnpm install turbo --global
```

### Apps and Packages

- `front-end`: a [Nuxt](https://nuxt.com/) app
- ~~`docs`: a [Nuxt](https://nuxt.com/) app~~
- ~~`web`: another [Vue3](https://vuejs.org/) app~~
- ~~`ui`: a stub Vue component library shared by both `web` and `docs` applications~~
- `eslint-config-custom`: `eslint` configurations (includes `@nuxtjs/eslint-config-typescript` and `@vue/eslint-config-typescript`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### 주의사항

Turbo는 다음 운영 체제에서 Yarn, npm 및 pnpm과 함께 작동합니다.

- macOS darwin 64-bit (Intel), ARM 64-bit (Apple Silicon)
  - Homebrew 맥용 패키지 관리자가 설치되어져 있어야 합니다.
    - `Homebrew` : [Homebrew 설치하기](https://brew.sh/ko/).
    - Homebrew 설치 명령어
      ```
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      ```
- Linux 64-bit, ARM 64-bit
- Windows 64-bit, ARM 64-bit
-

### node package install

To develop all apps and packages, run the following command:

```
cd `{프로젝트 root 경로}`
pnpm install 또는 npm install
```

### Build

To build all apps and packages, run the following command:

```
cd `{프로젝트 root 경로}`
//각 환경 env (로컬 : local, 개발: development, 운영: production)
pnpm build:{env} 또는 npm run build:{env}
```

### Develop

To develop all apps and packages, run the following command:

```
cd `{프로젝트 root 경로}`
//각 환경 env (로컬 : local, 개발: development, 운영: production)
pnpm dev:{env} 또는 npm run dev:{env}
```

## 이 외 turbo repo 참고사항

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd `{프로젝트 root 경로}`
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
