export function generateK6Script(parsedCurl: any, vus: number, duration: string): string {
    const { method, url, headers, body } = parsedCurl;
  
    return `
  import http from 'k6/http';
  import { check } from 'k6';
  
  export const options = {
    vus: ${vus},
    duration: '${duration}',
  };
  
  export default function () {
    const url = '${url}';
    const params = {
      headers: ${JSON.stringify(headers)},
    };
    const res = http.${method.toLowerCase()}(url, ${body ? `'${body}'` : 'null'}, params);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  }
  `;
  }