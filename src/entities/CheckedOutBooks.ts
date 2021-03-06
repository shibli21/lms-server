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

  @ManyToOne(() => User, (user) => user.id)
  @Field(() => User)
  issuedBy!: User;

  @ManyToOne(() => Book, (book) => book.id)
  @Field(() => Book)
  issuedBook!: Book;

  @Field(() => String)
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @Column()
  returnDate!: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  returnedDate: Date;

  @Field(() => Int)
  @Column({ default: 0 })
  fine!: number;
}
