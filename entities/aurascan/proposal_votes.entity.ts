import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
const knex = require('../../config/database');
const { Model } = require('objection');

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