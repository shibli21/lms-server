import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id!: number;

  @Column({ nullable: true })
  @Field(() => Int)
  studentId!: number;

  @Column()
  @Field()
  username!: string;

  @Column({ unique: true })
  @Field()
  email!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  @Field()
  status!: boolean;

  @Column({ default: false })
  @Field()
  isLibrarian!: boolean;

  @Column({ default: 0 })
  @Field(() => Int)
  numberOfBooksCheckedOut!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt!: Date;
}

//
