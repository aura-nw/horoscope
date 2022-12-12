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

@Entity('proposal_votes')
@Unique(['proposal_id', 'voter'])
class ProposalVotes extends Model {
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
	proposal_id: number | undefined;

	@Column()
	voter: string | undefined;

	@Column()
	tx_hash: string | undefined;

	@Column()
	option: string | undefined;
}

ProposalVotes.knex(knex);

module.exports = ProposalVotes;
