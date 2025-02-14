import {EOL} from "os";

export type ParseResult = {
  processOnce: boolean;
  localIncludes: string[];
  systemIncludes: string[];
  content: string;
}

export default class CppFileParser {
  private static readonly localIncludeRegExp = /^#include "([^"]+)"/;
  private static readonly systemIncludeRegExp = /^#include <([^>]+)>/;
  private static readonly pragmaOnceRegExp = /^#pragma once/;
  private static readonly pragmaRegExp = /^#pragma (.+)/;
  private systemPragmas = new Set<string>();

  public getSystemPragmas(): Set<string> {
    return this.systemPragmas;
  }

  public parse(fileContent: string): ParseResult {
    const fileLines = fileContent.split(EOL);
    const content: string[] = [];
    const systemIncludes = new Set<string>();
    const localIncludes = new Set<string>();
    let pragmaOnceFound = false;
    let emptyCount = 0;

    for (const line of fileLines) {
      if (CppFileParser.pragmaOnceRegExp.test(line)) {
        pragmaOnceFound = true;
        continue;
      }

	  const systemPragma = CppFileParser.pragmaRegExp.exec(line)?.[1];
	  if (systemPragma) {
		  this.systemPragmas.add(systemPragma);
		  continue;
	  }

      const systemInclude = CppFileParser.systemIncludeRegExp.exec(line)?.[1];
      if (systemInclude) {
        systemIncludes.add(systemInclude);
        continue;
      }

      const localInclude = CppFileParser.localIncludeRegExp.exec(line)?.[1];
      if (localInclude) {
        localIncludes.add(localInclude);
        continue;
      }

      if (line) {
        emptyCount = 0;
      } else if (++emptyCount > 1) {
        continue;
      }

      content.push(line);
    }

    return {
      processOnce: pragmaOnceFound,
      localIncludes: Array.from(localIncludes.values()),
      systemIncludes: Array.from(systemIncludes.values()),
      content: content.join(EOL)
    };
  }
}
