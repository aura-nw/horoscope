/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Model } from 'objection';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('../../config/database');

@Entity('delegator_rewards')
class DelegatorRewards extends Model {
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

	@Column()
	delegator_address: string | undefined;

	@Column()
	validator_address: string | undefined;

	@Column()
	amount: number | undefined;

	@Column()
	tx_hash: string | undefined;
}

DelegatorRewards.knex(knex);

module.exports = DelegatorRewards;
