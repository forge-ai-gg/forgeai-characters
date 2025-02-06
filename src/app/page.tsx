import { SpriteConfigQueryParams } from "@/types/sprites";
import Image from "next/image";
import { redirect } from "next/navigation";

// example url: https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/#?body=Body_color_light&head=Human_female_elderly_light&sex=male&shadow=Shadow_shadow&expression=Angry_male_light&eyes=Closing_Eyes_purple&ears=Elven_ears_light&nose=Big_nose_light&eyebrows=Thick_Eyebrows_blonde&wrinkes=Wrinkles_light&beard=Basic_Beard_blonde&mustache=Mustache_blonde&hair=Princess_blonde&shoulders=Legion_bronze&arms=Armour_steel&bauldron=Bauldron_brown&bracers=Bracers_steel&gloves=Gloves_brass&ring=Stud_Ring_blue&clothes=Longsleeve_black&chainmail=Chainmail_gray&legs=Armour_steel&shoes=Boots_black&weapon=Smash_axe&shield=Shield_crusader

type HomeProps = {
  searchParams: Promise<SpriteConfigQueryParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  if (!params.body || !params.head || !params.sex) {
    return redirect("/?body=Body_color_light&head=Human_male_light&sex=male");
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.set(key, value.toString());
    }
  });

  const spriteUrl =
    process.env["NEXT_PUBLIC_API_URL"] +
    `/api/sprite?${queryParams.toString()}`;

  console.log(spriteUrl);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Forge AI Generator API</h1>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-4 space-y-6">
          <h2 className="text-xl mb-2">Actions</h2>
          <div className="space-x-2">
            <div>coming soon</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-6">
          <div className="space-x-2">
            <div>
              <h2 className="text-xl mb-2">API URL</h2>
              <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
                <a href={spriteUrl} target="_blank">
                  {spriteUrl}
                </a>
              </pre>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-2">Preview</h2>
              <div className="border p-4 rounded bg-gray-50">
                <Image
                  src={spriteUrl}
                  alt="Generated Sprite"
                  width={1664}
                  height={6912}
                  className="pixelated"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
