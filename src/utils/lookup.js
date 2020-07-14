/**
 * @typedef {import("../services/coinRayDataFeed").MarketSymbol} MarketSymbol
 */

/**
 * Match current symbol against market symbols collection item.
 *
 * @param {MarketSymbol} item Market symbol item.
 * @param {string} findSymbol Symbol code to find.
 * @returns {boolean} TRUE when ID matches, FALSE otherwise.
 */
export function matchCurrentSymbol(item, findSymbol) {
  return item.symbol.replace("/", "") === findSymbol.replace("/", "");
}
