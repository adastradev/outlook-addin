import React from 'react';
import App, { AppProps } from '../App';
import { shallow } from 'enzyme';
import MockOffice from '../../../utilities/testing/mockOffice';
import { WELCOME_SCREEN_SETTTING } from '../../../utilities/config';
import Header from '../Header';
import HeroList from '../HeroList';
import RoomFinder from '../RoomFinder';

describe('App', () => {
    let mockOffice: MockOffice;

    describe('on initial load', () => {
        beforeAll(() => {
            const settings = {};
            settings[WELCOME_SCREEN_SETTTING] = undefined;
            mockOffice = new MockOffice({}, settings);
            mockOffice.mock(global);
        });

        it('renders a welcome page', () => {
            const props: AppProps = {
                isOfficeInitialized: true
            };
            const renderedApp = shallow(<App {...props} />);
    
            expect(renderedApp.find('.ms-welcome').length).toEqual(1);
            expect(renderedApp.find(Header).length).toEqual(1);
            expect(renderedApp.find(HeroList).length).toEqual(1);
            expect(renderedApp.find(RoomFinder).length).toEqual(0);
        });
    });

    describe('on subsequent loads', () => {
        beforeAll(() => {
            const settings = {};
            settings[WELCOME_SCREEN_SETTTING] = 1;
            mockOffice = new MockOffice({}, settings);
            mockOffice.mock(global);
        });

        it('renders the RoomList', () => {
            const props: AppProps = {
                isOfficeInitialized: true
            };
            const renderedApp = shallow(<App {...props} />);
    
            expect(renderedApp.find('.ms-welcome').length).toEqual(0);
            expect(renderedApp.find(RoomFinder).length).toEqual(1);
        });
    });
});
