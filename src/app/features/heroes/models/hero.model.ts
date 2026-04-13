export interface Hero {
  id: string;
  name: string;
  alias: string;
  power: string;
  universe: 'Marvel' | 'DC' | 'Other';
  createdAt: Date;
}
 
export type CreateHeroDto = Omit<Hero, 'id' | 'createdAt'>;
export type UpdateHeroDto = Partial<CreateHeroDto>;