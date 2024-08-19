import { Exclude } from 'class-transformer';
import { Borrow } from '../../borrows/entities/borrow.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
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

  @OneToMany(() => Borrow, (borrow) => borrow.member)
  borrowedBooks: Borrow[];

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: Date;

  // @AfterInsert()
  // async generateCode() {
  //   if (!this.code) {
  //     console.log('This method runs after an insert operation');
  //     this.code = `M${this.id.toString().padStart(3, '0')}`;
  //     console.log(this.id, this.code);
  //   }
  // }
}
