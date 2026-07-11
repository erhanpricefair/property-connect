import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Common Melbourne metro suburbs for MVP launch coverage. Not exhaustive —
// consumers whose suburb isn't listed can still submit via the "my suburb
// isn't listed" fallback, which is treated as UNSERVICEABLE per
// docs/PRD.md FR-1.
const MELBOURNE_SUBURBS: Array<{ name: string; postcode: string; region: string }> = [
  { name: "Melbourne", postcode: "3000", region: "Melbourne - Inner" },
  { name: "Southbank", postcode: "3006", region: "Melbourne - Inner" },
  { name: "Docklands", postcode: "3008", region: "Melbourne - Inner" },
  { name: "Carlton", postcode: "3053", region: "Melbourne - Inner" },
  { name: "Fitzroy", postcode: "3065", region: "Melbourne - Inner" },
  { name: "Collingwood", postcode: "3066", region: "Melbourne - Inner" },
  { name: "Richmond", postcode: "3121", region: "Melbourne - Inner" },
  { name: "South Yarra", postcode: "3141", region: "Melbourne - Inner" },
  { name: "Prahran", postcode: "3181", region: "Melbourne - Inner" },
  { name: "St Kilda", postcode: "3182", region: "Melbourne - Inner South" },
  { name: "Brighton", postcode: "3186", region: "Melbourne - Inner South" },
  { name: "Elwood", postcode: "3184", region: "Melbourne - Inner South" },
  { name: "Hawthorn", postcode: "3122", region: "Melbourne - Inner East" },
  { name: "Camberwell", postcode: "3124", region: "Melbourne - Inner East" },
  { name: "Glen Waverley", postcode: "3150", region: "Melbourne - Outer East" },
  { name: "Box Hill", postcode: "3128", region: "Melbourne - Inner East" },
  { name: "Doncaster", postcode: "3108", region: "Melbourne - Outer East" },
  { name: "Ringwood", postcode: "3134", region: "Melbourne - Outer East" },
  { name: "Blackburn", postcode: "3130", region: "Melbourne - Inner East" },
  { name: "Kew", postcode: "3101", region: "Melbourne - Inner East" },
  { name: "Northcote", postcode: "3070", region: "Melbourne - Inner North" },
  { name: "Brunswick", postcode: "3056", region: "Melbourne - Inner North" },
  { name: "Coburg", postcode: "3058", region: "Melbourne - Inner North" },
  { name: "Preston", postcode: "3072", region: "Melbourne - Inner North" },
  { name: "Reservoir", postcode: "3073", region: "Melbourne - Outer North" },
  { name: "Essendon", postcode: "3040", region: "Melbourne - Inner West" },
  { name: "Footscray", postcode: "3011", region: "Melbourne - Inner West" },
  { name: "Yarraville", postcode: "3013", region: "Melbourne - Inner West" },
  { name: "Williamstown", postcode: "3016", region: "Melbourne - Inner West" },
  { name: "Sunshine", postcode: "3020", region: "Melbourne - Outer West" },
  { name: "Werribee", postcode: "3030", region: "Melbourne - Outer West" },
  { name: "Point Cook", postcode: "3030", region: "Melbourne - Outer West" },
  { name: "Caroline Springs", postcode: "3023", region: "Melbourne - Outer West" },
  { name: "Dandenong", postcode: "3175", region: "Melbourne - Outer South East" },
  { name: "Frankston", postcode: "3199", region: "Melbourne - Outer South East" },
  { name: "Cranbourne", postcode: "3977", region: "Melbourne - Outer South East" },
  { name: "Pakenham", postcode: "3810", region: "Melbourne - Outer South East" },
  { name: "Mornington", postcode: "3931", region: "Melbourne - Mornington Peninsula" },
  { name: "Berwick", postcode: "3806", region: "Melbourne - Outer South East" },
  { name: "Bundoora", postcode: "3083", region: "Melbourne - Outer North" },
  { name: "Epping", postcode: "3076", region: "Melbourne - Outer North" },
];

async function main() {
  for (const suburb of MELBOURNE_SUBURBS) {
    const existing = await prisma.suburb.findFirst({
      where: { name: suburb.name, postcode: suburb.postcode, state: "VIC" },
    });

    if (existing) {
      console.log(`${suburb.name} ${suburb.postcode} already exists — skipping`);
      continue;
    }

    await prisma.suburb.create({
      data: {
        name: suburb.name,
        postcode: suburb.postcode,
        state: "VIC",
        region: suburb.region,
      },
    });

    console.log(`Created suburb: ${suburb.name} ${suburb.postcode}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
