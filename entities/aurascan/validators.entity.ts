/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from 'typeorm';
import { Model } from 'objection';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('../../config/database');

@Entity('validators')
class Validators extends Model {
	@PrimaryGeneratedColumn('increment')
	id = 0;

	@CreateDateColumn({
		type: 'timestamp',
		name: 'created_at',
	})
	created_at: Date | undefined;

	@UpdateDateColumn({
		type: 'timestamp',
		name: 'updated_at',
	})
	updated_at: Date | undefined;

	@Unique('operator_address', ['operator_address'])
	@Column()
	operator_address: string | undefined;

	@Column({ default: '' })
	acc_address: string | undefined;

	@Column({ default: '' })
	cons_address: string | undefined;

	@Column({ default: '' })
	cons_pub_key: string | undefined;

	@Column({ default: '' })
	title: string | undefined;

	@Column({ default: false })
	jailed: boolean | undefined;

	@Column({ type: 'text' })
	commission: string | undefined;

	@Column({ type: 'text' })
	max_commission: string | undefined;

	@Column({ type: 'text' })
	max_change_rate: string | undefined;

	@Column({ default: 0 })
	min_self_delegation: number | undefined;

	@Column({ type: 'text' })
	delegator_shares: string | undefined;

	@Column({ type: 'double' })
	power: number | undefined;

	@Column({ default: '' })
	percent_power: string | undefined;

	@Column({ type: 'double' })
	self_bonded: number | undefined;

	@Column({ default: '' })
	percent_self_bonded: string | undefined;

	@Column({ default: '' })
	website: string | undefined;

	@Column({ nullable: true, type: 'text' })
	details: string | undefined;

	@Column({ default: '' })
	identity: string | undefined;

	@Column({ default: '' })
	unbonding_height: string | undefined;

	@Column()
	unbonding_time: Date | undefined;

	@Column()
	update_time: Date | undefined;

	@Column({ default: 0 })
	up_time: string | undefined;

	@Column({ default: 0 })
	status: number | undefined;
}

Validators.knex(knex);

module.exports = Validators;
