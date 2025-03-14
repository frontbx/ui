import TestCase from '../../../testcase.js';

class Test extends TestCase
{
    run()
    {
        describe('trigger_event()', () =>
        {
            const [trigger_event] = frontbx.import(['trigger_event']).from('_');

            let scratch;
            
            beforeEach(() => scratch = this.setupScratch());

            afterEach(() => this.teardown(scratch));

            it('should find first children', () =>
            {        
                scratch.innerHTML = `
                    <div>1</div>
                    <span>2</span>
                    <div>
                        <span>3</span>
                    </div>
                    <i>5</i>
                `;

                this.expect(trigger_event(scratch).length).to.equal(4);
            });
        });
    }
}

let test = new Test();

test.run();
