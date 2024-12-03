export function parseCurlCommand(curlCommand: string) {
    const methodMatch = curlCommand.match(/-X\s+(\w+)/) || ['GET'];
    const urlMatch = curlCommand.match(/(https?:\/\/[^\s]+)/);
    const headersMatches = [...curlCommand.matchAll(/-H\s+'([^:]+):\s*([^']+)'/g)];
    const dataMatch = curlCommand.match(/-d\s+'([^']+)'/);
  
    if (!urlMatch) {
      throw new Error('Invalid curl command: URL not found');
    }
  
    const method = methodMatch[1].toUpperCase();
    const url = urlMatch[1];
    const headers: Record<string, string> = {};
    headersMatches.forEach(([, key, value]) => {
      headers[key] = value;
    });
    const body = dataMatch ? dataMatch[1] : null;
  
    return { method, url, headers, body };
  }