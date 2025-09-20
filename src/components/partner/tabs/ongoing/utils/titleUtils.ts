/**
 * Title cleaning utilities for OngoingTaskCard components
 */

/**
 * Extract clean service title from package text
 * @param description - Original description text
 * @returns Cleaned service title
 */
export const getCleanServiceTitle = (description: string): string => {
  // Look for "Package:" in the description (case insensitive, flexible spacing)
  // Handle various formats: "Package: text", "Package : text", "Package: text,", etc.
  let packageMatch = description.match(/Package\s*:\s*([^,]+)/i);
  
  // If no match with "Package:", try other patterns
  if (!packageMatch) {
    // Try to find text after "Package" without colon
    packageMatch = description.match(/Package\s+([^,]+)/i);
  }
  
  // If still no match, try to find any text that looks like a service
  if (!packageMatch) {
    // Look for text that contains "Cleaning" or "Service" or similar
    packageMatch = description.match(/([^,]*Cleaning[^,]*)/i) || 
                  description.match(/([^,]*Service[^,]*)/i) ||
                  description.match(/([^,]*Maintenance[^,]*)/i);
  }
  
  if (packageMatch) {
    let packageText = packageMatch[1].trim();
    
    // Remove "By :" patterns first
    packageText = packageText.replace(/By\s*:\s*/i, '').trim();
    
    // Use fallback patterns to remove common company names
    
    packageText = removeFallbackPatterns(packageText);
    
    // Clean up extra spaces
    packageText = packageText.replace(/\s+/g, ' ').trim();
    
    return packageText;
  }
  
  // If no package found, return the original description
  return description;
};


/**
 * Remove fallback patterns for common company names
 * @param text - Text to clean
 * @returns Cleaned text
 */
const removeFallbackPatterns = (text: string): string => {
  const fallbackPatterns = [
    // Remove "Kavya" and variations
    /\bKavya\s+(Enterprises|Services|Solutions|Company|Ltd|Limited|Pvt|Private|Inc|Corp|Corporation)?\b/gi,
    /\bKavya\b/gi,
    // Remove "SM Cleaning" and variations
    /\bSM\s+Cleaning\s+(Services|Solutions|Company|Ltd|Limited|Pvt|Private|Inc|Corp|Corporation)?\b/gi,
    /\bSM\s+Cleaning\b/gi,
    // Remove "By :" patterns
    /By\s*:\s*/gi,
    // Remove common company suffixes
    /\s+(Enterprises|Services|Solutions|Company|Ltd|Limited|Pvt|Private|Inc|Corp|Corporation)\s*$/gi,
    /\s+(Cleaning|Maintenance|Repair|Installation)\s*$/gi
  ];
  
  for (const pattern of fallbackPatterns) {
    const beforeReplace = text;
    text = text.replace(pattern, ' ').trim();
    if (beforeReplace !== text) {
      break; // Stop after first successful removal
    }
  }
  
  return text;
};
