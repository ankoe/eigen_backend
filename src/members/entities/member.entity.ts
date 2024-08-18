import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  code?: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  penaltyEndDate?: Date;

  // @OneToMany(() => Borrow, (borrow) => borrow.member)
  // borrowedBooks: Borrow[];

  @DeleteDateColumn()
  deletedAt?: Date;

  // borrowedBooks: string[] = [];
  // penaltyEndDate?: Date;

  // @AfterInsert()
  // async generateCode() {
  //   if (!this.code) {
  //     console.log('This method runs after an insert operation');
  //     this.code = `M${this.id.toString().padStart(3, '0')}`;
  //     console.log(this.id, this.code);
  //   }
  // }
}
