/**
 * Ngân hàng câu hỏi sử dụng trực tiếp trong Gameplay (vượt chướng ngại vật).
 * Bám sát chương trình Tiếng Anh 10 Global Success (Units 1 - 10).
 * Cấu trúc bắt buộc: { q: string, a: string[], c: number }
 */
export const GAMEPLAY_QUESTIONS = [
  // Unit 1: Family Life
  {
    q: 'My mother usually ______ the cooking, but today my father is cooking.',
    a: ['do', 'does', 'is doing', 'did'],
    c: 1,
  },
  {
    q: 'Sharing household chores helps strengthen family ______.',
    a: ['bonds', 'groceries', 'routines', 'burdens'],
    c: 0,
  },
  {
    q: 'Listen! Someone ______ the piano in the living room right now.',
    a: ['plays', 'played', 'is playing', 'has played'],
    c: 2,
  },
  {
    q: 'In my family, my brother is responsible for ______ out the rubbish every evening.',
    a: ['take', 'taking', 'to take', 'took'],
    c: 1,
  },
  {
    q: 'My father is the ______ of the family, while my mother manages the household budget.',
    a: ['homemaker', 'breadwinner', 'guest', 'teenager'],
    c: 1,
  },
  {
    q: 'Doing chores together teaches children essential life ______.',
    a: ['skills', 'games', 'views', 'topics'],
    c: 0,
  },
  // Unit 2: Humans and the Environment
  {
    q: 'Look at those dark clouds! It ______ rain heavily in a few minutes.',
    a: ['will', 'is going to', 'was going to', 'would'],
    c: 1,
  },
  {
    q: 'More trees ______ in our school yard by the Youth Union next Sunday.',
    a: ['will plant', 'are planting', 'will be planted', 'planted'],
    c: 2,
  },
  {
    q: 'Using reusable bags instead of plastic ones helps reduce our carbon ______.',
    a: ['footprint', 'footstep', 'shadow', 'signal'],
    c: 0,
  },
  {
    q: 'Organic products are grown without the use of harmful ______.',
    a: ['appliances', 'chemicals', 'litter', 'energy'],
    c: 1,
  },
  {
    q: 'Remember to turn ______ household appliances when they are not in use.',
    a: ['on', 'up', 'off', 'into'],
    c: 2,
  },
  // Unit 3: Music
  {
    q: 'My parents let me ______ the school music club this semester.',
    a: ['join', 'to join', 'joining', 'joined'],
    c: 0,
  },
  {
    q: 'She practiced singing for months, ______ she won the first prize in the contest.',
    a: ['or', 'but', 'so', 'yet'],
    c: 2,
  },
  {
    q: 'The judges decided ______ the talented guitarist to the final round.',
    a: ['send', 'to send', 'sending', 'sent'],
    c: 1,
  },
  {
    q: 'Chau Van singing is an ancient form of Vietnamese ______ music.',
    a: ['modern', 'traditional', 'electronic', 'foreign'],
    c: 1,
  },
  {
    q: 'We watched the street musicians ______ folk songs in the old quarter.',
    a: ['perform', 'to perform', 'performed', 'performs'],
    c: 0,
  },
  // Unit 4: For a Better Community
  {
    q: 'While we ______ clothes for charity, the headmaster visited our booth.',
    a: ['sorted', 'are sorting', 'were sorting', 'have sorted'],
    c: 2,
  },
  {
    q: 'Volunteering at the local orphanage was a truly ______ experience for all of us.',
    a: ['rewarded', 'rewarding', 'reward', 'rewards'],
    c: 1,
  },
  {
    q: 'The children were very ______ when they received new comic books.',
    a: ['excite', 'exciting', 'excited', 'excitement'],
    c: 2,
  },
  {
    q: 'Our school raised funds to help people in the ______ areas after the storm.',
    a: ['flooded', 'flooding', 'flood', 'floods'],
    c: 0,
  },
  // Unit 5: Inventions
  {
    q: 'Scientists ______ many smart devices to improve human healthcare over the last decade.',
    a: ['invent', 'invented', 'have invented', 'are inventing'],
    c: 2,
  },
  {
    q: 'A 3D printer is used for ______ solid objects similar to the original model.',
    a: ['produce', 'producing', 'to produce', 'produced'],
    c: 1,
  },
  {
    q: 'Artificial Intelligence enables machines ______ from human data efficiently.',
    a: ['learn', 'learning', 'to learn', 'learned'],
    c: 2,
  },
  {
    q: 'This new laptop is lightweight and ______, so you can carry it anywhere.',
    a: ['portable', 'bulky', 'heavy', 'broken'],
    c: 0,
  },
  // Unit 6: Gender Equality
  {
    q: 'Both men and women should ______ equal opportunities in the workplace.',
    a: ['give', 'be given', 'given', 'giving'],
    c: 1,
  },
  {
    q: 'Girls must not ______ to leave school early to get married.',
    a: ['force', 'forced', 'be forced', 'forcing'],
    c: 2,
  },
  {
    q: 'To become a surgeon, a medical student has to work hard and stay ______ under pressure.',
    a: ['calm', 'careless', 'impatient', 'noisy'],
    c: 0,
  },
  // Unit 7: Viet Nam and International Organisations
  {
    q: 'Since joining the WTO, Viet Nam has become one of the ______ destinations for foreign investors.',
    a: ['attractive', 'more attractive', 'most attractive', 'as attractive'],
    c: 2,
  },
  {
    q: 'UNICEF aims to create a ______ world for disadvantaged children.',
    a: ['good', 'better', 'best', 'well'],
    c: 1,
  },
  {
    q: 'International organisations promote peace and economic ______ among nations.',
    a: ['development', 'pollution', 'conflict', 'delay'],
    c: 0,
  },
  // Unit 8: New Ways to Learn
  {
    q: 'The teacher ______ designed this blended learning course won a national award.',
    a: ['which', 'who', 'whose', 'whom'],
    c: 1,
  },
  {
    q: 'Blended learning combines online digital media with ______ classroom methods.',
    a: ['face-to-face', 'hand-in-hand', 'step-by-step', 'side-by-side'],
    c: 0,
  },
  {
    q: 'Students ______ laptops are connected to the school network can access the digital library.',
    a: ['who', 'which', 'whose', 'that'],
    c: 2,
  },
  // Unit 9: Protecting the Environment
  {
    q: 'The biologist said that deforestation ______ the natural habitat of many wild species.',
    a: ['destroys', 'destroyed', 'will destroy', 'is destroying'],
    c: 1,
  },
  {
    q: 'Our teacher asked us if we ______ our presentation on endangered animals.',
    a: ['finish', 'have finished', 'had finished', 'will finish'],
    c: 2,
  },
  {
    q: 'Illegal hunting is a major threat to ______ species around the globe.',
    a: ['endangered', 'common', 'domestic', 'harmless'],
    c: 0,
  },
  // Unit 10: Ecotourism
  {
    q: 'If tourists ______ litter on the beach, the marine ecosystem will suffer.',
    a: ['leave', 'left', 'had left', 'would leave'],
    c: 0,
  },
  {
    q: 'If I ______ more free time this summer, I would join an ecotour in Phong Nha Cave.',
    a: ['have', 'had', 'will have', 'have had'],
    c: 1,
  },
  {
    q: 'Responsible ecotourism helps preserve local culture and ______ nature.',
    a: ['conserve', 'damage', 'pollute', 'ignore'],
    c: 0,
  },
  {
    q: 'You can buy handmade ______ crafted by local villagers to support their community.',
    a: ['souvenirs', 'factories', 'vehicles', 'chemicals'],
    c: 0,
  },
];
