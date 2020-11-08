import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Author } from "./Author";
import { Book } from "./Book";

@Entity()
@ObjectType()
export class BookItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id!: number;

  @Column()
  @Field()
  title!: string;

  @ManyToOne(() => Author, (author) => author.books, { onUpdate: "CASCADE" })
  @Field(() => Author)
  author: Author;

  @Column()
  @Field()
  edition!: string;

  @Column()
  @Field()
  category!: string;

  @Column({ default: 0 })
  @Field(() => Int)
  numberOfCopies!: number;

  @OneToMany(() => Book, (book) => book.bookItem)
  @JoinColumn()
  @Field(() => [Book])
  books: Book[];

  @Field(() => String)
  @Column()
  publicationDate: Date;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
