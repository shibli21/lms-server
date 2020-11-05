import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Author } from "./Author";

@Entity()
@ObjectType()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id!: number;

  @Column({ unique: true })
  @Field()
  isbnNumber!: number;

  @Column()
  @Field()
  title!: string;

  @ManyToOne(() => Author, (author) => author.books, { cascade: true })
  @Field(() => Author)
  author: Author;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
