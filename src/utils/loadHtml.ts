export async function loadHtml(filename: string) {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const content = await response.text();
    console.log("File loaded successfully, length:", content.length);
    return content;
  } catch (error) {
    console.error("Error loading file:", error);
    throw error;
  }
}
