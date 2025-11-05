import { formatDateTime } from "@common/helpers/time.helper";
import { MailFilter } from "./dto/mail-filter.dto";
import { EstadoAtencion } from "@modules/estado-atencion/entities/estado-atencion.entity";
import { MailAttention } from "./entities/mail-attention.entity";
import { Op, Sequelize } from "sequelize";
import { MailType } from "./enum/mail-type.enum";
import { groupBy } from "@common/helpers/group.helper";
import { MailRepository } from "./repositories/mail.repository";

export const EmailTicketList = async (whereThread: any, query: MailFilter, mailRepository: MailRepository) => {
    if (query.contains) {
        whereThread.content = { [Op.like]: `%${query.contains}%` };
    }
    if (query.notContains) {
        whereThread.content = { [Op.notLike]: `%${query.notContains}%` };
    }
    if(query.type){
        whereThread.type = query.type
    }
    if (query.date) {
        const dateFilter = new Date(query.date);
        dateFilter.setHours(0, 0, 0, 0);
        const finishDate = new Date(dateFilter);
        finishDate.setDate(finishDate.getDate() + 1);
        whereThread.createdAt = {
            [Op.gte]: dateFilter,
            [Op.lt]: finishDate
        };
    }
    const whereAttention: any = { 
    };
    if(query.stateId){
        whereAttention.stateId = query.stateId;
    }
    if(query.advisorEmailId){
        whereAttention.advisorUserId = query.advisorEmailId
    }
    if (query.from) {
        whereAttention.emailCitizen = { [Op.like]: `%${query.from}%` };
    }
    /*const tickets = await mailThreadRepository.findAll({
        attributes: ['id', 'subject', 'mailAttentionId', 'createdAt',
            [Sequelize.fn('MIN', Sequelize.col('MailThread.created_at')), 'oldestCreatedAt']
        ],
        where: whereThread,
        include: [
            {
                model: MailAttention,
                where: whereAttention,
                attributes: ['ticketCode', 'emailCitizen'],
                include: [
                    {
                        model: EstadoAtencion,
                        attributes: ['nombre']
                    }
                ]
            },
        ],
        group: ['MailThread.mail_attention_id', 'MailAttention.id', 'MailAttention->state.id'],
        order: [['createdAt', 'ASC']]
    })*/
    const tickets = await mailRepository.findAll({
        attributes: [
            'mailAttentionId',
            'subject',
            'createdAt','id',
        ],
        where: whereThread,
        include: [
            {
                model: MailAttention,
                where: whereAttention,
                attributes: ['ticketCode', 'emailCitizen'],
                include: [
                    {
                        model: EstadoAtencion,
                        attributes: ['nombre'],
                    },
                ],
            },
        ],
        order: [['id', 'DESC']],
    });
    const ticketsData = tickets.map(a=>a.toJSON())
    const grouped = groupBy(ticketsData, (u) => u.mailAttentionId);
    const oldestPerGroup = Object.values(grouped).map(group => {
        return group.reduce((oldest, current) => {
            return new Date(current.createdAt) < new Date(oldest.createdAt)
                ? current
                : oldest;
        });
    });
    const ticketsJson = oldestPerGroup.map(json => {
        return {
            id: json.id,
            subject: json.subject,
            mailAttentionId: json.mailAttentionId,
            ticketCode: json.mailAttention.ticketCode,
            from: json.mailAttention.emailCitizen,
            open: json.mailAttention.state.nombre == 'Abierto',
            date: (json.createdAt),
        }
    })
    return ticketsJson;
}
export const GetTypeEmail=(type:MailType)=>{
   switch (type) {
    case MailType.ADVISOR:
    return 'ASESOR';
    case MailType.CITIZEN:
    return 'CIUDADANO';
    case MailType.INTERN_REPLY:
    return 'RESPUESTA INTERNA';
    case MailType.INTERN_FORWARD:
    return 'REENVIO INTERNO';
    default:
    return 'SIN TIPO'
   }
}
