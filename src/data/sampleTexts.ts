export interface SampleText {
  id: string;
  title: string;
  type: 'ai' | 'human' | 'mixed';
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'ai-sample',
    title: 'AI Generated Sample',
    type: 'ai',
    text: `In today's fast-paced digital era, the landscape of renewable energy continues to evolve at an unprecedented pace. It is crucial to delve into the transformative capabilities of sustainable infrastructure. Furthermore, clean energy solutions serve as a testament to human ingenuity, intertwining efficiency and environmental stewardship in a delicate tapestry.

Moreover, solar and wind technologies stand as pillars of modern progress, fostering economic resilience while combating climate change. By embracing these multifaceted frameworks, global economies can optimize resource allocation and cultivate enduring prosperity. In conclusion, navigating this green frontier requires collective commitment, innovation, and holistic strategic planning.`
  },
  {
    id: 'human-sample',
    title: 'Human Written Sample',
    type: 'human',
    text: `We spent three days in the garage trying to get the carburetor on Dad's old '74 pickup unstuck. Honestly, by Sunday afternoon, my knuckles were skinned, we smelled like stale gasoline, and neither of us had the patience to keep at it. 

Dad kicked the front tire, cursed under his breath, and muttered something about selling the whole heap for scrap metal. Then, just as I was packing up the wrenches, he smiled, grabbed two cold sodas from the cooler, and said, "Well, at least the radio still turns on." We sat on the tailgate until dusk, laughing about how many bolts we had left over.`
  },
  {
    id: 'mixed-sample',
    title: 'Mixed / Edited Sample',
    type: 'mixed',
    text: `Artificial intelligence is undeniably transforming workflow automation across modern enterprises. Organizations leverage machine learning models to streamline customer interactions and synthesize complex datasets with notable precision.

However, when our team rolled out an automated ticketing bot last month, the reality on the ground was messy. Customers were annoyed when the bot couldn't decipher basic edge cases, and our tier-2 support leads had to manually untangle half the escalated requests during the first week.

Therefore, striking a balanced equilibrium between automated efficiency and human intuition remains paramount for successful technological adoption.`
  }
];
