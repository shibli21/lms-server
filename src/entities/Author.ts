import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./Book";

@Entity()
@ObjectType()
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id!: number;

  @Column({ unique: true })
  @Field()
  authorName!: string;

  @Column()
  @Field()
  description!: string;

  @OneToMany(() => Book, (book) => book.author)
  @Field(() => [Book], { nullable: true })
  books: Book[];
}
