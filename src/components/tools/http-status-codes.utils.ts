export type HttpStatusCode = {
  code: number
  name: string
  desc: string
}

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  { code: 100, name: "Continue", desc: "지금까지의 요청에 문제가 없으니 계속 진행하라는 임시 응답입니다." },
  { code: 101, name: "Switching Protocols", desc: "클라이언트의 요청에 따라 프로토콜을 전환합니다." },
  { code: 200, name: "OK", desc: "요청이 성공적으로 처리되었습니다." },
  { code: 201, name: "Created", desc: "요청이 성공하여 새로운 리소스가 생성되었습니다." },
  { code: 202, name: "Accepted", desc: "요청을 받았으나 아직 처리하지 않았습니다." },
  { code: 204, name: "No Content", desc: "요청은 성공했으나 응답 본문이 없습니다." },
  { code: 206, name: "Partial Content", desc: "범위 요청에 따라 리소스의 일부만 전송합니다." },
  { code: 301, name: "Moved Permanently", desc: "요청한 리소스가 영구적으로 새 URL로 이동했습니다." },
  { code: 302, name: "Found", desc: "요청한 리소스가 일시적으로 다른 URL에 있습니다." },
  { code: 303, name: "See Other", desc: "다른 URL에서 GET 요청으로 결과를 확인하라는 응답입니다." },
  { code: 304, name: "Not Modified", desc: "리소스가 변경되지 않아 캐시된 버전을 사용할 수 있습니다." },
  { code: 307, name: "Temporary Redirect", desc: "메서드를 유지한 채 일시적으로 다른 URL로 리다이렉트합니다." },
  { code: 308, name: "Permanent Redirect", desc: "메서드를 유지한 채 영구적으로 다른 URL로 리다이렉트합니다." },
  { code: 400, name: "Bad Request", desc: "잘못된 문법으로 요청을 전송하여 서버가 이해할 수 없습니다." },
  { code: 401, name: "Unauthorized", desc: "요청 처리를 위해 인증(로그인)이 필요합니다." },
  { code: 403, name: "Forbidden", desc: "서버가 접근 권한이 없어 요청을 거부합니다." },
  { code: 404, name: "Not Found", desc: "요청한 리소스를 찾을 수 없습니다." },
  { code: 405, name: "Method Not Allowed", desc: "해당 리소스에서 허용되지 않는 메서드를 사용했습니다." },
  { code: 409, name: "Conflict", desc: "요청이 현재 서버 리소스 상태와 충돌합니다." },
  { code: 410, name: "Gone", desc: "요청한 리소스가 영구적으로 삭제되어 더 이상 존재하지 않습니다." },
  { code: 418, name: "I'm a teapot", desc: "찻주전자로 커피를 내릴 수 없다는 농담 상태 코드입니다." },
  { code: 422, name: "Unprocessable Entity", desc: "문법은 올바르나 의미상의 오류로 요청을 처리할 수 없습니다." },
  { code: 429, name: "Too Many Requests", desc: "짧은 시간에 너무 많은 요청을 보냈습니다." },
  { code: 500, name: "Internal Server Error", desc: "서버 내부 에러가 발생했습니다." },
  { code: 501, name: "Not Implemented", desc: "서버가 요청 메서드를 지원하지 않습니다." },
  { code: 502, name: "Bad Gateway", desc: "게이트웨이/프록시 서버가 잘못된 응답을 받았습니다." },
  { code: 503, name: "Service Unavailable", desc: "서버가 과부하 또는 점검으로 일시적으로 응답할 수 없습니다." },
  { code: 504, name: "Gateway Timeout", desc: "게이트웨이/프록시 서버가 응답을 제때 받지 못했습니다." },
]

export function filterCodes(
  query: string,
  codes: HttpStatusCode[] = HTTP_STATUS_CODES,
): HttpStatusCode[] {
  const q = query.toLowerCase()
  return codes.filter(
    (c) =>
      c.code.toString().includes(query) ||
      c.name.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q),
  )
}
