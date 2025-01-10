# 배포 관련 정리

## 프로젝트 구조
```text
├── apps/
│   ├── front-end/         # 웹 프로젝트
│   └── front-design/      # 디자인 시스템
├── packages/
│   └── ui/               # 공통 UI 컴포넌트
│   ├── 기타 등등...
├── turbo.json
├── Dockerfile
└── .github/workflows/
    └── deploy.yml
```

## 새 프로젝트 추가 가이드
### Dockerfile 설정
```text
# ============= Project Build Configuration =============
# 1. 환경 파일 복사
COPY apps/your-project/.env.${BUILD_ENV} apps/your-project/.env

# 2. 의존성 설치 및 빌드
RUN cd apps/your-project && \
    pnpm install && \
    pnpm run build:${BUILD_ENV}

# ============= Port Configuration =============
EXPOSE <your-port>
```

### GitHub Actions 설정
  - deploy.yml 파일의 Docker 실행 부분 수정:
```text
docker run -d --name wisexpense-apps \
  -p 80:12000 \                    # 기존 프론트엔드
  -p 81:<your-port> \              # 새 프로젝트
  -e PORT=12000 \
  -e YOUR_PROJECT_PORT=<your-port> \
  ...
```

### turbo.json 설정
   - 개발 프레임워크 환경에 다른 outputs 에 빌드할 디렉토리를 추가 작성한다.
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".nuxt/**", ".output/**", "dist/**"]
    },
    "build:development": {
      "dependsOn": ["^build"],
      "outputs": [".nuxt/**", ".output/**", "dist/**"]
    }
  }
}
```

### 환경 변수 설정 (개발 staging 기준 운영은 DEV를 빼면됨. turbo 관련 환경은 동일)
  - GitHub Secrets 필수 항목
  - TURBO_TOKEN: Turborepo 빌드 캐시 토큰
  - TURBO_TEAM: Turborepo 팀 식별자
  - DEV_AWS_ACCESS_KEY_ID: AWS 접근 키
  - DEV_AWS_SECRET_ACCESS_KEY: AWS 시크릿 키
  - DEV_AWS_SG_ID: AWS 보안 그룹 ID
  - DEV_AWS_REGION: AWS 리전
  - DEV_EC2_HOST: EC2 호스트 주소
  - DEV_EC2_USERNAME: EC2 사용자명
  - DEV_EC2_SSH_KEY: EC2 SSH 키

## 배포 프로세스
1. 빌드 프로세스
  - pnpm 의존성 설치
  - Turborepo를 통한 빌드
  - 테스트 실행
2. Docker 이미지 생성
  - 멀티 스테이지 빌드 사용
  - 프로젝트별 환경 설정 적용
  - ECR에 이미지 푸시
3. EC2 배포
  - 보안 그룹 설정
  - Docker 컨테이너 실행
  - 포트 매핑 및 환경 변수 설정

## 주의사항
  - 새 프로젝트 추가 시 포트 중복 확인
  - 환경 변수 설정 확인
  - GitHub Secrets 설정 확인
  - EC2 보안 그룹 인바운드 규칙 확인