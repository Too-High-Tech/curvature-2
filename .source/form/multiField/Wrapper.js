import { Config     } from 'Config';
import { Repository } from 'curvature/base/Repository';
import { View } from 'curvature/base/View';

export class Wrapper extends View
{
	constructor(args)
	{
		super(args);

		this.template = `
			<div class = "wrapped-field [[classes]]">
				<div
					cv-on = "click:deleteImage(event, key)"
					style = "display: inline; cursor:pointer;"
				>
					[[icon]]
				</div>
				<div
					cv-on = "click:editRecord(event, key)"
					class = "field-content"
				>
					<span title = "[[fieldName]]: [[id]]">
						[[title]]
					</span>
				</div>
			</div>
			<div style = "display:none">[[field]]</div>
		`;

		this.args.field     = this.args.field || '!';
		this.args.keyword   = '';
		this.args.title     = '';
		this.args.record    = {};
		this.args.key       = this.args.field.key;
		this.args.classes   = '';
		this.args.icon      = '×';
		this.deleted        = false;
		

		this.args.field.args.bindTo('fieldName', (v)=>{
			this.args.fieldName = v;
		});

		this.args.fieldName = this.args.field.args.name;

		this.args.id = this.args.field.args.value.id;

		this.args.bindTo('id', (v)=>{
			this.args.field.args.value.id = v;
		});

		this.args.field.args.value.bindTo('id', (v)=>{
			if(!v)
			{
				return;
			}

			Repository.request(
				this.backendPath()
				, {id: v}
			).then(response=>{
				this.args.id = v;

				let record = response.body[0];

				if(!record)
				{
					this.args.publicId = null;
					this.args.title    = null;

					return;
				}

				console.log(record);

				this.refresh(record);
			});
		});

		this.args.field.args.value.bindTo('keyword', (v)=>{
			this.args.keyword = v;
		});
	}

	editRecord()
	{
		this.args.parent.editRecord(
			this.args.record
			, this
		);
	}

	deleteImage(event, index)
	{
		if(!this.deleted)
		{
			this.args.icon = '↺';
			this.args.parent.deleteImage(index);
			this.deleted = true;
		}
		else
		{
			this.args.icon = '×';
			this.args.parent.undeleteImage(index);
			this.deleted = false;
		}
	}

	backendPath()
	{
		return Config.backend + this.args.parent.args.attrs['data-endpoint'];
	}

	getRecordTitle(record)
	{
		return record.title
			|| record.publicId
			|| record.id;
	}

	refresh(model)
	{
		for(let i in model)
		{
			this.args[i] = model[i];
		}

		this.args.record = model;

		this.args.title = this.getRecordTitle(model);
	}
}
