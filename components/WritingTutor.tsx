import React, { useState, useEffect, useCallback } from 'react';
import { generateTutorTopicAndSteps, getTutorFeedbackForChunk } from '../services/geminiService';
import type { TutorTopic, TutorFeedback } from '../types';
import { Loader } from './ui/Loader';
import { Button } from './ui/Button';

export const WritingTutor: React.FC = () => {
    const [tutorTopic, setTutorTopic] = useState<TutorTopic | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [fullParagraph, setFullParagraph] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<TutorFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTopic = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setTutorTopic(null);
        setFullParagraph([]);
        setCurrentStepIndex(0);
        setUserInput('');
        setFeedback(null);
        try {
            const topicData = await generateTutorTopicAndSteps();
            setTutorTopic(topicData);
        } catch (err) {
            console.error("Failed to fetch writing topic:", err);
            setError("Could not load a writing topic. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopic();
    }, [fetchTopic]);
    
    const handleCheckWriting = async () => {
        if (!userInput.trim() || !tutorTopic) return;
        setIsChecking(true);
        setFeedback(null);
        setError(null);
        try {
            const result = await getTutorFeedbackForChunk(tutorTopic.topic, tutorTopic.steps[currentStepIndex], userInput);
            setFeedback(result);
        } catch (err) {
            console.error("Failed to check writing:", err);
            setError("Feedback failed. Please try again later.");
        } finally {
            setIsChecking(false);
        }
    };

    const handleNextStep = () => {
        const sentenceToAdd = feedback?.correctedSentence || userInput;
        setFullParagraph(prev => [...prev, sentenceToAdd]);
        setCurrentStepIndex(prev => prev + 1);
        setUserInput('');
        setFeedback(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader /></div>;
    }
    
    if (error) {
        return <div className="text-center"><p className="text-red-400 mb-4">{error}</p><Button onClick={fetchTopic}>Try Again</Button></div>;
    }

    if (!tutorTopic) {
        return <div className="text-center"><p className="text-gray-400">No topic loaded.</p></div>
    }

    const isLastStep = currentStepIndex >= tutorTopic.steps.length - 1;
    const isFinished = currentStepIndex >= tutorTopic.steps.length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold">Writing Tutor</h2>
                    <p className="text-gray-400">Let's build a paragraph step-by-step.</p>
                </div>
                <Button onClick={fetchTopic} variant="secondary">New Topic</Button>
            </div>

            {/* Topic and Progress */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-gray-300 mb-2">Topic:</h3>
                <p className="text-lg text-white">{tutorTopic.topic}</p>
                {!isFinished && <p className="text-sm text-gray-400 mt-2">Step {currentStepIndex + 1} of {tutorTopic.steps.length}</p>}
            </div>

            {isFinished ? (
                 <div className="bg-green-900/50 border border-green-700 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-300">Great Work!</h3>
                    <p className="text-green-200 mt-2">You've completed the paragraph.</p>
                </div>
            ) : (
                <>
                    {/* Current Step Instruction */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="font-semibold text-gray-200">{tutorTopic.steps[currentStepIndex]}</p>
                    </div>

                    {/* Text Area and Buttons */}
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Write your sentence here..."
                        className="w-full h-24 p-4 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-colors"
                        disabled={!!feedback}
                    />
                    <div className="flex gap-4">
                        <Button onClick={handleCheckWriting} disabled={isChecking || !userInput.trim() || !!feedback}>
                            {isChecking ? 'Checking...' : 'Check My Writing'}
                        </Button>
                        {feedback && (
                            <Button onClick={handleNextStep}>
                                {isLastStep ? 'Finish Paragraph' : 'Next Step'}
                            </Button>
                        )}
                    </div>
                    
                    {isChecking && <div className="flex items-center gap-2 text-gray-400"><Loader /><span>Tutor is thinking...</span></div>}

                    {/* Feedback Area */}
                    {feedback && (
                        <div className={`p-4 rounded-lg border ${feedback.isCorrect ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'}`}>
                           <p className={`font-semibold ${feedback.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                {feedback.feedback}
                           </p>
                           {!feedback.isCorrect && feedback.correctedSentence && (
                               <p className="text-gray-300 mt-2">Suggestion: <span className="text-white font-mono">{feedback.correctedSentence}</span></p>
                           )}
                        </div>
                    )}
                </>
            )}

             {/* Full Paragraph View */}
             {fullParagraph.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold mt-4">Your Paragraph:</h3>
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-200 whitespace-pre-wrap">{fullParagraph.join(' ')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};