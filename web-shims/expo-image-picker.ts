type PickerAsset = {
  uri: string;
  base64?: string;
};

type PickerResult =
  | { canceled: true; assets: [] }
  | { canceled: false; assets: PickerAsset[] };

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export async function launchImageLibraryAsync(options?: {
  base64?: boolean;
  mediaTypes?: string[];
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<PickerResult> {
  if (typeof document === "undefined") {
    return { canceled: true, assets: [] };
  }

  return await new Promise<PickerResult>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = async () => {
      const file = input.files?.[0];
      input.remove();

      if (!file) {
        resolve({ canceled: true, assets: [] });
        return;
      }

      const uri = URL.createObjectURL(file);
      const result: PickerAsset = { uri };

      if (options?.base64) {
        const dataUrl = await readFileAsDataUrl(file);
        result.base64 = dataUrl.split(",")[1];
      }

      resolve({ canceled: false, assets: [result] });
    };

    document.body.appendChild(input);
    input.click();
  });
}
