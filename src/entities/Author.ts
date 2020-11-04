import { Book } from "./Book";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

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

  @OneToMany(() => Book, (book) => book.id)
  @Field(() => [Book])
  books: Book[];
}
