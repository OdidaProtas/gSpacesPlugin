import { urlPatterns } from '$lib/router';
import type grapesjs from 'grapesjs';

export function gSpaceApIList(
	editor: grapesjs.Editor,
	config: { tables: any[]; pages: any[]; pageId: string }
) {
	let { tables = [], pages = [], pageId }: any = config;

	const page: any = pages.find((page: { id: string; path: string }) => page.id === pageId);

	const spaceUrl = urlPatterns([page])[0];

	const params = spaceUrl?.params ?? [];

	tables = [...tables, { name: 'example', columns: [], rows: [] }];

	const tableNames = tables.map((table: any) => table.name);

	editor.DomComponents.addType('space-login-component', {
		model: {
			defaults: {
				tagName: 'div'
			}
		}
	});

	editor.DomComponents.addType('space-user-component', {
		model: {
			defaults: {
				tagName: 'div'
			}
		}
	});

	editor.DomComponents.addType('api-table-component', {
		model: {
			defaults: {
				attributes: {
					'data-table': ''
				},
				traits: [{ type: 'select', options: tableNames, name: 'data-table' }]
			},
			init() {
				this.listenTo(this, 'change:attributes:data-table', this.handleUpdateDataTable);
			},
			handleUpdateDataTable() {
				const dataTable = this.getAttributes()['data-table'];
				this.replaceWith(
					`<div style='min-height:100px' data-table="${dataTable}" data-gjs-type='api-table-component' ></div>`
				);
			},
			updated(property: string) {
				if (property === 'traits') {
					const table = this.getTrait('data-table')?.getValue();
					if (table) this.setAttributes({ 'data-table': table });
				}
			}
		},
		view: {
			onRender({ el }: { el: HTMLElement }) {
				const dataTable = this.model.getAttributes()['data-table'];
				const table = tables.find((tb: any) => tb.name === dataTable);
				const columns = table?.columns ?? [];
				const rows = table?.rows ?? [];

				const tableEl = document.createElement('table');
				const tHead = document.createElement('thead');

				for (let column of columns) {
					const th = document.createElement('th');
					th.innerText = column.name;
					tHead.appendChild(th);
				}

				tableEl.appendChild(tHead);

				const tbody = document.createElement('tbody');
				for (let row of rows) {
					const rowEl = document.createElement('tr');
					for (let column of columns) {
						const td = document.createElement('td');
						td.innerText = row[column.name];
						rowEl.appendChild(td);
					}
					tbody.appendChild(rowEl);
				}

				tableEl.appendChild(tbody);
				el.appendChild(tableEl);
			}
		}
	});

	editor.DomComponents.addType('api-grid-component', {
		model: {
			defaults: {
				tagName: 'div',
				attributes: {
					'data-table': ''
				},
				traits: [{ type: 'select', options: tableNames, name: 'data-table' }]
			},
			init() {
				this.listenTo(this, 'change:attributes:data-table', this.handleDataTableUpdated);
			},
			handleDataTableUpdated() {
				let tableName = this.getAttributes()['data-table'];

				this.replaceWith(
					`<div style='min-height:100px' data-table=${tableName} data-gjs-type='api-table-component' ></div>`
				);
			},
			updated(property: string) {
				if (property === 'traits') {
					const tableName = this.getTrait('data-table')?.getValue();
					if (tableName) this.setAttributes({ 'data-table': tableName });
				}
			}
		},
		view: {
			onRender({ el }: any) {
				const tableName = this.model.getAttributes()['data-table'];
				const dataTable = tables.find((table: any) => table.name === tableName);
				const rows = dataTable?.rows ?? [];
				const columns = dataTable?.columns ?? [];

				const table = document.createElement('table');
				const tableHead = document.createElement('thead');

				for (let column of columns) {
					const th = document.createElement('th');
					th.innerText = column.name;
					tableHead.appendChild(th);
				}

				table.appendChild(tableHead);

				let tb = document.createElement('tbody');

				for (let row of rows) {
					const tr = document.createElement('tr');
					for (let column of columns) {
						const td = document.createElement('td');
						td.innerText = row[column.name];
						tr.appendChild(td);
					}
					tb.appendChild(tr);
				}

				table.appendChild(tb);

				el.appendChild(table);
			}
		}
	});

	editor.DomComponents.addType('api-button-component', {
		model: {
			defaults: {
				tagName: 'div',
				'data-btn-text': '',
				'data-table': '',
				height: '',
				droppable: false,
				width: '',
				traits: [
					'data-btn-text',
					{
						name: 'type',
						type: 'select',
						options: ['button', 'text', 'hidden', 'submit', 'delete-item', 'add to basket']
					}
				]
			},
			init() {
				this.listenTo(this, 'change:attributes:data-btn-text', this.handleUpdate);
			},
			handleUpdate() {
				const tableName = this.parent()?.getAttributes()['data-table'];
				const rowIndex = this.parent()?.getAttributes()['data-index'];

				const key = this.getAttributes()['data-btn-text'];
				this.replaceWith(
					`<div data-btn-text=${key} data-table="${tableName}" data-index="${rowIndex}"   data-gjs-type="api-button-component" ></div>`
				);
			},
			updated(property: string) {
				if (property === 'traits') {
					try {
						const btnText = this.getTrait('data-btn-text')?.getValue();
						if (btnText) this.setAttributes({ 'data-btn-text': btnText });
					} catch (error) {}
				}
			}
		},
		view: {
			onRender({ el }: any) {
				const btn = document.createElement('button');
				const btnText = this.model.getAttributes()['data-btn-text'];
				const index = this.model.parent()?.index() ?? 0;
				const dataTable = this.model.parent()?.getAttributes()['data-table'];
				const table: any = tables.find((table: any) => table.name === dataTable);
				const rows = table?.rows ?? [];
				const row = rows[index];
				btn.textContent = btnText ?? 'Button';
				el.appendChild(btn);
			}
		}
	});

	editor.DomComponents.addType('api-ecommerce-product-item', {
		model: {
			defaults: {
				droppable: true,
				selectible: false,
				attributes: {
					'data-item': '',
					'data-index': 0,
					'data-table': ''
				},
				tagName: 'div'
			},
			init() {
				this.listenTo(this, 'change:data-index', this.handleUpdate);
				this.listenTo(this, 'change:style', this.handleUpdateChild);
			},
			handleUpdate() {
				// console.log(this.getAttributes());
			},
			handleUpdateChild() {
				console.log('Yaaay');
			},
			updated(property: any, value: any, prevValue: any) {
				if (property === 'components') {
					let parent = this.parent();
					let parentComponents = parent?.get('components');
					parentComponents?.forEach((comp) => {
						if (comp.cid !== this.cid) {
							let clone = this.clone();
							const existingAttributes = comp.getAttributes();
							clone.setAttributes(existingAttributes);
							comp.replaceWith(clone);
						}
					});
				}
			}
		}
	});

	editor.DomComponents.addType('api-ecommerce-product-listing', {
		model: {
			defaults: {
				droppable: true,
				attributes: {
					'data-table': ''
				},
				tagName: 'div',
				traits: [
					{
						type: 'select',
						options: tableNames,
						name: 'data-table'
					},
					{
						type: 'checkbox',
						name: 'data-paginate'
					}
				]
			},
			init() {
				this.setDefaultContent();
				this.listenTo(this, 'change:attributes:data-table', this.resetComponents);
				this.listenTo(this, 'change:components', this.handlePropChange);
			},
			makeOnlyFirstEditable() {
				const children = this.get('components');
				if (children?.length) {
					children?.forEach((child) => {
						if (child.index() !== 0) {
							child.set('editable', false);
							child.set('selectable', false);
						}
					});
				}
			},
			setDefaultContent() {
				if (!this.components.length)
					for (let i = 0; i < tables.length; i++) {
						const table = tables[i];
						this
							.append(`<div data-index="${i}"  style="min-height:100px; padding:20px;margin:20px"  data-gjs-type="api-ecommerce-product-item">
					        <p>${(table as any).name}</p>
					</div>`);
					}
			},
			updated(property: any, value: any, prevValue: any) {
				if (property === 'traits') {
					try {
						const traits = this.getTrait('data-table');
						const tableName = traits?.getValue();
						if (tableName) this.setAttributes({ 'data-table': tableName });
						const paginatableTraits = this.getTrait('data-paginate')?.getValue();
						// this.setTraits([
						// 	{
						// 		type: 'number',
						// 		name: 'Items per page'
						// 	}
						// ]);
					} catch (error) {}
				}
			},
			resetComponents() {
				this.empty();
				try {
					const tableName = this.getAttributes()['data-table'];
					let table: any = tables.find((tb: any) => tb.name === tableName);
					for (let i = 0; i < table?.rows?.length; i++) {
						const row: any = table.rows[i];
						this
							.append(`<div data-index="${i}" data-table=${tableName} style="min-height:100px;padding:20px;margin:20px"  data-gjs-type="api-ecommerce-product-item">
                            ${Object.keys(row)
															.map((item: any) => {
																return `<div  data-gjs-type="api-text-component"  data-key="${item}" data-table="${tableName}" data-index="${i}" >${row[item]}</div>`;
															})
															.join(' ')}
				        
                        
                            </div>`);
					}
				} catch (error) {}
			},
			handlePropChange() {}
		}
	});

	editor.Components.addType('api-button-component', {
		model: {
			defaults: {
				tagName: 'button'
			}
		}
	});

	editor.DomComponents.addType('api-detail-page-container', {
		model: {
			defaults: {
				droppable: true,
				selectible: false,
				attributes: {
					'data-item': '',
					'data-index': 0,
					'data-table': ''
				},
				tagName: 'div',
				traits: [
					{
						type: 'select',
						options: tableNames,
						name: 'data-table'
					},
					{
						type: 'select',
						name: 'select-by',
						options: ['url-params', 'url-search-params']
					},
					{
						type: 'select',
						name: 'Page parameters',
						options: params
					}
				]
			},
			init() {
				this.listenTo(this, 'change:data-index', this.handleUpdate);
				this.listenTo(this, 'change:attributes:data-table', this.handleUpdateChild);
			},
			handleUpdate() {
				console.log('index update');
				// console.log(this.getAttributes());
			},
			handleUpdateChild() {
				this.get('components')?.forEach((comp) => {
					comp.getAttributes();
					comp.setAttributes({ 'data-table': '', 'data-key': '' });
					comp.addTrait({ name: 'data-key', type: 'string' }, { at: 1 });
				});
			},
			handleUpdateComponents() {},
			updated(property: any, value: any, prevValue: any) {
				if (property === 'traits') {
					const traits = this.getTrait('data-table');
					const tableName = traits?.getValue();
					if (tableName) this.setAttributes({ 'data-table': tableName });
				}
			}
		}
	});

	editor.DomComponents.addType('api-image-component', {
		model: {
			defaults: {
				tagName: 'div',
				'data-src': '',
				'data-table': '',
				height: '',
				droppable: false,
				draggable: 'div, div *',
				width: '',
				src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+',
				traits: ['data-src', 'height', 'width']
			},
			init() {
				this.listenTo(this, 'change:attributes:data-src', this.handleUpdate);
				this.listenTo(this, 'change:attributes:height', this.handleUpdate);
				this.listenTo(this, 'change:attributes:width', this.handleUpdate);
			},
			handleUpdate() {
				const tableName = this.parent()?.getAttributes()['data-table'];
				const rowIndex = this.parent()?.getAttributes()['data-index'];
				const height = this?.getAttributes()['height'];
				const width = this?.getAttributes()['width'];

				const key = this.getAttributes()['data-src'];
				this.replaceWith(
					`<div data-src=${key} height=${height} width=${width} data-table="${tableName}" data-index="${rowIndex}"   data-gjs-type="api-image-component" ></div>`
				);
			},
			updated(property: string) {
				if (property === 'traits') {
					try {
						const srcName = this.getTrait('data-src')?.getValue();
						const height = this.getTrait('height')?.getValue();
						const width = this.getTrait('width')?.getValue();
						if (srcName) this.setAttributes({ 'data-src': srcName });
						if (height) this.setAttributes({ height: height });
						if (width) this.setAttributes({ width: width });
					} catch (error) {}
				}
			}
		},
		view: {
			onRender({ el }: any) {
				const img = document.createElement('img');
				const srcset = this.model.getAttributes()['data-src'];
				const height = this.model.getAttributes()['height'];
				const width = this.model.getAttributes()['width'];
				if (height) img.style.height = height;
				if (width) img.style.width = width;
				const index = this.model.parent()?.index() ?? 0;
				const dataTable = this.model.parent()?.getAttributes()['data-table'];
				const table: any = tables.find((table: any) => table.name === dataTable);
				const rows = table?.rows ?? [];
				const row = rows[index];
				img.srcset = row[srcset ?? ''];
				img.alt = 'API Image plugin';
				el.appendChild(img);
			}
		}
	});

	editor.DomComponents.addType('api-form-component', {
		model: {
			defaults: {
				attributes: {
					'data-index': 0,
					'data-table': ''
				},
				tagName: 'div',
				traits: [
					{
						type: 'select',
						options: tableNames,
						name: 'data-table'
					}
				]
			},
			init() {
				this.listenTo(this, 'change:attributes:data-table', this.resetComponents);
			},
			updated(property: any, value: any, prevValue: any) {
				if (property === 'traits') {
					try {
						const traits = this.getTrait('data-table');
						const tableName = traits?.getValue();
						if (tableName) this.setAttributes({ 'data-table': tableName });
					} catch (error) {}
				}
			},
			resetComponents() {
				this.empty();
				try {
					const tableName = this.getAttributes()['data-table'];
					let table: any = tables.find((tb: any) => tb.name === tableName);
					for (let i = 0; i < table?.columns?.length; i++) {
						const column: any = table.columns[i];
						this
							.append(`<div data-index="${i}" data-table=${tableName} style="min-height:100px;padding:20px;margin:20px"  data-gjs-type="api-item-component">
				                <input  data-gjs-type="api-text-component" placeholder=${column.name}  data-table="${tableName}" data-index="${i}" >Text</input>
				        </div>`);
					}
				} catch (error) {}
			}
		}
	});

	editor.DomComponents.addType('api-text-component', {
		model: {
			defaults: {
				attributes: {
					'data-key': '',
					'data-index': 0,
					'data-table': '',
					'data-variant': ''
				},
				tagName: 'div',
				traits: [
					'data-key',
					{
						type: 'select',
						options: ['small', 'p', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1'],
						name: 'variant'
					}
				]
			},
			init() {
				this.listenTo(this, 'change:attributes:data-key', this.handleUpdate);
				this.listenTo(this, 'change:attributes:data-variant', this.handleUpdate);
			},
			handleUpdate() {
				const key = this.getAttributes()['data-key'];
				const tableName = this.parent()?.getAttributes()['data-table'];
				const rowIndex = this.parent()?.getAttributes()['data-index'];
				const variant = this.parent()?.getAttributes()['data-variant'];

				this.replaceWith(
					`<div data-key=${key}  data-table="${tableName}" data-index="${rowIndex}"   data-gjs-type="api-text-component" ></div>`
				);

				// 	let rowIndex = cmp.index();

				// 	let _row = row[rowIndex];

				// 	cmp.components().forEach((c) => {
				// 		if (c.index() === index) {
				// 			c.replaceWith(
				// 				`<div data-key=${key}  data-table="${tableName}" data-index="${rowIndex}"   data-gjs-type="api-text-component" >${
				// 					_row[key] ?? 'Text'
				// 				}</div>`
				// 			);
				// 		}
				// 	});

				// 	const clonedComponent = parent?.toHTML();
				// 	cmp.remove();
				// 	grandy?.append(String(clonedComponent));
				// });
			},
			updated(property: any, value: any, prevValue: any) {
				if (property === 'traits') {
					try {
						const traits = this.getTrait('data-key');
						const tableName = this.getTrait('data-obj-key')?.getValue() ?? traits?.getValue();
						if (tableName) this.setAttributes({ 'data-key': tableName });
					} catch (error) {}
				}
			}
		},
		view: {
			tagName: 'div',
			onRender({ el }: any) {
				const textDiv = document.createElement('div');
				const key = this.model.getTrait('data-key')?.getValue();
				const index = this.model.parent()?.index() ?? 0;
				const dataTable = this.model.parent()?.getAttributes()['data-table'];
				const table: any = tables.find((table: any) => table.name === dataTable);
				const rows = table?.rows ?? [];
				const row = rows[index];
				textDiv.innerText = row[key ?? ''] ?? 'Api text component';
				el.appendChild(textDiv);
			}
		}
	});

	editor.DomComponents.addType('api-item-component', {
		model: {
			defaults: {
				droppable: true,
				selectible: false,
				attributes: {
					'data-item': '',
					'data-index': 0,
					'data-table': ''
				},
				tagName: 'div'
			},
			init() {
				this.listenTo(this, 'change:data-index', this.handleUpdate);
				this.listenTo(this, 'change:dimension', this.handleUpdateChild);
			},
			handleUpdate() {
				// console.log(this.getAttributes());
			},
			handleUpdateChild() {
				console.log('yaay');
			},
			handleClassUpdates() {
				let parent = this.parent();
				const classes = this.getClasses();
				let parentComponents = parent?.get('components');
				parentComponents?.forEach((comp) => {
					if (comp.cid !== this.cid) {
						let clone = this.clone();
						const existingAttributes = comp.getAttributes();
						clone.setAttributes(existingAttributes);
						clone.setClass(classes.join(' '));
						comp.replaceWith(clone);
					}
				});
			},
			handleComponentsUpdates() {
				let parent = this.parent();
				let parentComponents = parent?.get('components');
				parentComponents?.forEach((comp) => {
					if (comp.cid !== this.cid) {
						let clone = this.clone();
						const existingAttributes = comp.getAttributes();
						clone.setAttributes(existingAttributes);
						comp.replaceWith(clone);
					}
				});
			},
			updated(property: any, value: any, prevValue: any) {
				console.log('property', property);
				if (property === 'classes') {
					this.handleClassUpdates();
				}

				if (property === 'components') {
					this.handleComponentsUpdates();
				}
			}
		}
	});

	editor.DomComponents.addType('api-list-component', {
		model: {
			defaults: {
				droppable: true,
				attributes: {
					'data-table': ''
				},
				tagName: 'div',
				traits: [
					{
						type: 'select',
						options: tableNames,
						name: 'data-table'
					},
					{
						type: 'checkbox',
						name: 'data-paginate'
					}
				]
			},
			init() {
				this.setDefaultContent();
				this.listenTo(this, 'change:attributes:data-table', this.resetComponents);
				this.listenTo(this, 'change:components', this.handlePropChange);
			},
			makeOnlyFirstEditable() {
				const children = this.get('components');
				if (children?.length) {
					children?.forEach((child) => {
						if (child.index() !== 0) {
							child.set('editable', false);
							child.set('selectable', false);
						}
					});
				}
			},
			setDefaultContent() {
				// const dataTable = this.getAttributes()['data-table'];
				// if (dataTable) {
				// 	this.resetComponents();
				// }
				// if (!this.components.length)
				// 	for (let i = 0; i < tables.length; i++) {
				// 		const table = tables[i];
				// 		this
				// 			.append(`<div data-index="${i}"  style="min-height:100px; padding:20px;margin:20px"  data-gjs-type="api-item-component">
				// 	        <p>${(table as any).name}</p>
				// 	</div>`);
				// 	}
			},
			updated(property: any, value: any, prevValue: any) {
				if (property === 'traits') {
					try {
						const traits = this.getTrait('data-table');
						const tableName = traits?.getValue();
						if (tableName) this.setAttributes({ 'data-table': tableName });
					} catch (error) {}
				}
			},
			resetComponents() {
				this.empty();
				try {
					const tableName = this.getAttributes()['data-table'];
					let table: any = tables.find((tb: any) => tb.name === tableName);
					console.log(tableName);
					for (let i = 0; i < table?.rows?.length; i++) {
						const row: any = table.rows[i];
						this.append(
							`<div data-index="${i}" data-table=${tableName} style="min-height:100px;padding:20px;margin:20px"  data-gjs-type="api-item-component">
                            ${Object.keys(row)
															.map((item: any) => {
																console.log(row);

																return `<div  data-gjs-type="api-text-component"  data-key="${item}" data-table="${tableName}" data-index="${i}" ></div>`;
															})
															.join(' ')}
				        
                        
                            </div>`
						);
					}
				} catch (error) {}
			},
			handlePropChange() {}
		}
	});

	editor.BlockManager.add('Api list component', {
		label: 'API List',
		content: `<div  style="min-height:144px" data-gjs-type="api-list-component">
		<p>Update collection information in traits</p>
		</div>`
	});

	editor.BlockManager.add('Api text component', {
		label: 'API Text',
		content: `<div  data-gjs-type="api-text-component"></div>`
	});
	editor.BlockManager.add('Api form component', {
		label: 'API Form',
		content: `<div  data-gjs-type="api-form-component"></div>`
	});

	editor.BlockManager.add('Api image component', {
		label: 'API Image',
		content: `<div src="" data-src="" data-gjs-type="api-image-component"></div>`
	});

	editor.BlockManager.add('API Item Detail Page', {
		label: 'API Item Detail Page Container',
		content: `<div style="min-height:100vh"  data-gjs-type="api-detail-page-container">
		<p>Select the collection, and params in the trait manager</p>
		</div>`
	});

	editor.BlockManager.add('API Ecommerce listing', {
		label: 'API Ecommerce Listing',
		content: `<div  data-gjs-type="api-ecommerce-product-listing"></div>`
	});

	editor.BlockManager.add('API Button component', {
		label: 'API Button Listing',
		content: `<div  data-gjs-type="api-button-component"></div>`
	});

	editor.BlockManager.add('API Grid Component', {
		label: 'Grid',
		content: "<div style='min-height:100px' data-gjs-type='api-grid-component' ></div>"
	});

	editor.BlockManager.add('API Table Component', {
		label: 'API Table',
		content: "<div style='min-height:100px' data-gjs-type='api-table-component' ></div>"
	});

	editor.BlockManager.add('Space login', {
		label: 'Space login',
		content: "<div style='min-height:100px' data-gjs-type='space-login-component' ></div>"
	});

	editor.BlockManager.add('Space user component', {
		label: 'Space user component',
		content: "<div style='min-height:100px' data-gjs-type='space-user-component' ></div>"
	});
}
