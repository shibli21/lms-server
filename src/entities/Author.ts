import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BookItem } from "./BookItem";

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
  @Field({ nullable: true })
  description: string;

  @OneToMany(() => BookItem, (bookItem) => bookItem.author)
  @Field(() => [BookItem], { nullable: true })
  books: BookItem[];
}
