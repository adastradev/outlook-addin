import React from 'react';
import { shallow } from 'enzyme';
import MockOffice from '../../../utilities/testing/mockOffice';
import RoomFinder, { IRoomFinderProps } from '../RoomFinder';
import RoomList from '../RoomList';
import MockAdapter from 'axios-mock-adapter';
import { Spinner } from 'office-ui-fabric-react';
import axios from 'axios';
import moment from 'moment';
import { waitForState } from 'enzyme-async-helpers';
import { SELECTED_ROOM_SETTING } from '../../../utilities/config';
const uuidv4 = require('uuid/v4');

describe('RoomFinder', () => {
    let mockOffice: MockOffice;
    let mockAxios;

    beforeAll(() => {
        mockOffice = new MockOffice();
        mockOffice.mock(global);
        mockAxios = new MockAdapter(axios);
    });
    
    afterAll(() => {
        mockAxios.restore();
    });
    
    afterEach(() => {
        mockAxios.reset();
    });
    
    it('initially renders a loading spinner', () => {
        const onBookRoomSuccessful = jest.fn((a, b, c, d, e) => {});
        const props: IRoomFinderProps = {
            useSampleData: false,
            apiBasePath: 'https://aais.com',
            onBookRoomSuccessful
        };
        const roomFinder = shallow(<RoomFinder {...props} />, { disableLifecycleMethods: true });
        roomFinder.setState({ isLoading: true });

        expect(roomFinder.find(Spinner).length).toEqual(1);
    });

    it('loads rooms when they are returned from the GET call', async () => {
        const onBookRoomSuccessful = jest.fn((a, b, c, d, e) => {});
        const props: IRoomFinderProps = {
            useSampleData: false,
            apiBasePath: 'https://aais.com',
            onBookRoomSuccessful
        };
        const returnValue = [
            { 
                roomId: '100',
                roomBuildingAndNumber: 'TEST 100',
                whyIsRoomIdHereTwice: '??',
                available: true
            }, {
                roomId: '200',
                roomBuildingAndNumber: 'TEST 200',
                whyIsRoomIdHereTwice: '??',
                available: false
            }
        ];
        const startTime = mockOffice.values.context.mailbox.item.start.getAsync((x) => encodeURIComponent(moment(x.value).format('YYYY-MM-DDTHH:mm:ss')));
        const endTime = mockOffice.values.context.mailbox.item.end.getAsync((x) => encodeURIComponent(moment(x.value).format('YYYY-MM-DDTHH:mm:ss')));
        const url = `${props.apiBasePath}/spaces/rooms/availability?start=${startTime}&end=${endTime}`;

        mockAxios.onGet(url).reply(200, returnValue);

        const roomFinder = await shallow(<RoomFinder {...props} />);
        
        await waitForState(roomFinder, state => state.roomData.length == returnValue.length);

        expect(roomFinder.find(Spinner).length).toEqual(0);
        expect(roomFinder.find('.book-room-button').length).toEqual(1);
        expect(roomFinder.find(RoomList).length).toEqual(1);
        expect(roomFinder.find(RoomList).get(0).props.items.length).toEqual(returnValue.length);
    });

    it('books a room correctly', async () => {
        const onBookRoomSuccessful = jest.fn((a, b, c, d, e) => {});
        const props: IRoomFinderProps = {
            useSampleData: false,
            apiBasePath: 'https://aais.com',
            onBookRoomSuccessful
        };
        const returnValue = [
            { 
                roomId: '100',
                roomBuildingAndNumber: 'TEST 100',
                whyIsRoomIdHereTwice: '??',
                available: true
            }, {
                roomId: '200',
                roomBuildingAndNumber: 'TEST 200',
                whyIsRoomIdHereTwice: '??',
                available: false
            }
        ];

        let officeItem = mockOffice.values.context.mailbox.item;
        let startTime = officeItem.start.getAsync((x) => moment(x.value).format('YYYY-MM-DDTHH:mm:ss'));
        let endTime = officeItem.end.getAsync((x) => moment(x.value).format('YYYY-MM-DDTHH:mm:ss'));
        let userName = officeItem.organizer.getAsync((x) => x.value.displayName);
        let userEmail = officeItem.organizer.getAsync((x) => x.value.emailAddress);
        let subject = `${officeItem.subject.getAsync((x) => x.value)} (via Outlook)`;
        
        const url = `${props.apiBasePath}/spaces/rooms/availability?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
        mockAxios.onGet(url).reply(200, returnValue);

        const roomFinder = await shallow(<RoomFinder {...props} />);
        
        await waitForState(roomFinder, state => state.roomData.length === returnValue.length && state.isLoading === false);

        const room = returnValue[0];
        const postUrl = `${props.apiBasePath}/spaces/rooms/${room.roomId}/reservation`;
        mockAxios.onPost(postUrl).reply(200, { data: { eventId: uuidv4() }});

        // Select a room
        const settings = {};
        settings[SELECTED_ROOM_SETTING] = returnValue[0];
        const roomSelectedOfficeMock = new MockOffice({}, settings, mockOffice.uuid);
        roomSelectedOfficeMock.mock(global);

        // Click book room button
        expect(roomFinder.find('.book-room-button').length).toEqual(1);
        roomFinder.find('.book-room-button').simulate('click');
        
        // Wait to go through the booking
        await waitForState(roomFinder, state => state.isBooking === false);

        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ 
            name: subject, userName, userEmail, start: moment(startTime).format('YYYY-MM-DD HH:mm'), end: moment(endTime).format('YYYY-MM-DD HH:mm')
        }));
        expect(onBookRoomSuccessful).toHaveBeenCalledTimes(1);
        expect(roomSelectedOfficeMock.values.context.mailbox.item.location.setAsync).toHaveBeenCalledWith(room.roomBuildingAndNumber, expect.any(Function));
    });
});
