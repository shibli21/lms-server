import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./Book";
import { User } from "./User";

@Entity()
@ObjectType()
export class CheckedOutBooks extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id!: number;

  @ManyToOne(() => User, (user) => user.studentId)
  @Field(() => User)
  studentId!: User;

  @ManyToOne(() => Book, (book) => book.isbnNumber)
  @Field(() => Book)
  bookId!: Book;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  returnDate: Date;

  @Field(() => Int)
  @Column({ default: 0 })
  fine!: number;
}
