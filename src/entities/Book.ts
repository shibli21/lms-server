import { BookItem } from "./BookItem";
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
  rackNumber!: string;

  @Column({ default: true })
  @Field()
  status!: boolean;

  @ManyToOne(() => BookItem, (bookItem) => bookItem.books)
  @Field(() => BookItem)
  bookItem: BookItem;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
